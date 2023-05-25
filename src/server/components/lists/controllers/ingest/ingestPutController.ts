import { Request, Response } from "express";
import { formRunnerPostRequestSchema } from "server/components/formRunner";
import { logger } from "server/services/logger";
import { prisma } from "server/models/db/prisma-client";
import { recordListItemEvent } from "shared/audit";
import { AuditEvent, Prisma, Status } from "@prisma/client";
import { DeserialisedWebhookData } from "server/models/listItem/providers/deserialisers/types";
import { ListJsonData } from "server/models/types";
import { ServiceType } from "shared/types";
import { deserialise } from "server/models/listItem/listItemCreateInputFromWebhook";
import { getServiceTypeName } from "server/components/lists/helpers";
import { EVENTS } from "server/models/listItem/listItemEvent";
import { getObjectDiff } from "./helpers";
import { sendAnnualReviewCompletedEmailForList } from "server/components/annual-review/helpers";

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
    const listJsonData = listItem.list.jsonData as ListJsonData;
    const annualReviewReference = listJsonData?.currentAnnualReview?.reference;

    const { isAnnualReview = false } = value.metadata;
    const event = isAnnualReview ? EVENTS.CHECK_ANNUAL_REVIEW(diff, annualReviewReference) : EVENTS.EDITED(diff);
    const status = isAnnualReview ? Status.CHECK_ANNUAL_REVIEW : Status.EDITED;
    const listItemPrismaQuery: Prisma.ListItemUpdateArgs = {
      where: { id: Number(id) },
      data: {
        status,
        history: {
          create: event,
        },
        jsonData: jsonDataWithUpdatedJsonData,
      },
    };

    await prisma.$transaction([
      prisma.listItem.update(listItemPrismaQuery),
      recordListItemEvent(
        {
          eventName: "edit",
          itemId: Number(id),
        },
        AuditEvent.EDITED
      ),
    ]);

    if (isAnnualReview) {
      await sendAnnualReviewCompletedEmailForList(listItem.listId);
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
