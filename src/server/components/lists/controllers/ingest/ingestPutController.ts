import type { Request, Response } from "express";
import { formRunnerPostRequestSchema } from "server/components/formRunner";
import { logger } from "server/services/logger";
import { prisma } from "server/models/db/prisma-client";
import { Status } from "@prisma/client";
import { ServiceType } from "shared/types";
import { deserialise } from "server/models/listItem/listItemCreateInputFromWebhook";
import { getServiceTypeName } from "server/components/lists/helpers";
import { EVENTS } from "shared/listItemEvent";
import { getObjectDiff } from "./helpers";
import { sendAnnualReviewCompletedEmailForList } from "server/components/annual-review/helpers";
import { sendManualActionNotificationToPost, sendProviderInformedOfEditEmail } from "server/services/govuk-notify";
import type { ListJsonData } from "server/models/types";
import type { EventCreate } from "shared/listItemEvent";
import type { DeserialisedWebhookData } from "server/models/listItem/providers/deserialisers/types";
import type { Prisma } from "@prisma/client";

export async function ingestPutController(req: Request, res: Response) {
  const id = req.params.id;
  const serviceType = getServiceTypeName(req.params.serviceType) as ServiceType;
  const { value, error } = formRunnerPostRequestSchema.validate(req.body);

  if (!serviceType || !(serviceType in ServiceType)) {
    return res.status(500).json({
      error: "serviceType is incorrect, please make sure form's webhook output configuration is correct",
    });
  }

  if (error?.message) {
    logger.error(`ingestPutController. Validating schema failed ${error.message}`);
    return res.status(422).json({ error: "request could not be processed - post data could not be parsed" });
  }

  let data: DeserialisedWebhookData;

  try {
    data = deserialise(value);
  } catch (e) {
    return res.status(422).json({ error: "questions could not be deserialised" });
  }

  const listItem = await prisma.listItem.findUnique({
    where: { id: Number(id) },
    include: {
      list: {
        select: {
          jsonData: true,
        },
      },
      history: {
        orderBy: {
          time: "desc",
        },
      },
    },
  });

  if (!listItem) {
    return res.status(404).send({
      error: {
        message: `Unable to store updates - listItem ${listItem} could not be found`,
      },
    });
  }

  try {
    const { updatedJsonData, ...jsonData } = listItem.jsonData as DeserialisedWebhookData;
    const diff = getObjectDiff(jsonData, data);
    const jsonDataWithUpdatedJsonData = {
      ...jsonData,
      updatedJsonData: diff,
    };
    const jsonDataOnly = { ...jsonData, ...diff };

    const { isAnnualReview = false, isPostEdit = false } = value.metadata;
    let event: AllowedEvents | AllowedEvents[] = EVENTS.EDITED(diff);
    let status: Status = Status.EDITED;

    if (isAnnualReview) {
      const listJsonData = listItem.list.jsonData as ListJsonData;
      const annualReviewReference = listJsonData?.currentAnnualReview?.reference;
      event = EVENTS.CHECK_ANNUAL_REVIEW(diff, annualReviewReference);
      status = Status.CHECK_ANNUAL_REVIEW;
    }

    if (isPostEdit) {
      event = EVENTS.EDITED(diff, {
        isPostEdit: true,
        note: value.metadata.message,
        userId: value.metadata.userId,
      });
      if (listItem.isPublished) {
        event = [event, EVENTS.PUBLISHED(value.metadata.userId)];
        status = Status.PUBLISHED;
      } else {
        // keep original status
        status = listItem.status;
      }
    }

    const listItemPrismaQuery: Prisma.ListItemUpdateArgs = {
      where: { id: Number(id) },
      data: {
        status,
        history: {
          create: event,
        },
        jsonData: isPostEdit ? jsonDataOnly : jsonDataWithUpdatedJsonData,
      },
    };

    await prisma.listItem.update(listItemPrismaQuery);
    if (isAnnualReview) {
      await sendAnnualReviewCompletedEmailForList(listItem.listId);
    } else {
      if (isPostEdit) {
        await sendProviderInformedOfEditEmail(jsonData.emailAddress, {
          contactName: jsonData.contactName,
          typePlural: serviceType,
          message: value.metadata.message,
        });
      } else {
        await sendManualActionNotificationToPost(listItem.listId, "CHANGED_DETAILS");
      }
    }

    return res.status(204).send();
  } catch (e) {
    logger.error(`ingestPutController Error: ${e.message}`);
    /**
     * TODO:- Queue?
     */
    return res.status(422).send({ message: "List item failed to update" });
  }
}

type AllowedEvents = EventCreate<"EDITED"> | EventCreate<"CHECK_ANNUAL_REVIEW"> | EventCreate<"PUBLISHED">;
