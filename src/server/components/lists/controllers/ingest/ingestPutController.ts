import { Request, Response } from "express";
import { formRunnerPostRequestSchema } from "server/components/formRunner";
import { logger } from "server/services/logger";
import { prisma } from "server/models/db/prisma-client";
import { recordListItemEvent } from "server/models/audit";
import { AuditEvent, Prisma, Status } from "@prisma/client";
import { DeserialisedWebhookData } from "server/models/listItem/providers/deserialisers/types";
import { ServiceType } from "server/models/types";
import { deserialise } from "server/models/listItem/listItemCreateInputFromWebhook";
import { getServiceTypeName } from "server/components/lists/helpers";
import { EVENTS } from "server/models/listItem/listItemEvent";

export async function ingestPutController(
  req: Request,
  res: Response
): Promise<Response<any, Record<string, any>> | undefined> {
  const id = req.params.id;
  const serviceType = getServiceTypeName(req.params.serviceType) as ServiceType;
  const { value, error } = formRunnerPostRequestSchema.validate(req.body);

  if (!serviceType || !(serviceType in ServiceType)) {
    return res.status(500).json({
      error: "serviceType is incorrect, please make sure form's webhook output configuration is correct",
    });
  }

  if (error) {
    logger.error(`request could not be processed - post data could not be parsed ${error.message}`);
    return res.status(422).json({ error: error.message });
  }

  let data: DeserialisedWebhookData;

  try {
    data = deserialise(value);
  } catch (e) {
    return res.status(422).json({ error: "questions could not be deserialised" });
  }

  try {
    const listItem = await prisma.listItem.findUnique({
      where: { id: Number(id) },
    });

    if (!listItem) {
      return res.status(404).send({
        error: {
          message: `Unable to store updates - listItem could not be found`,
        },
      });
    }

    const jsonData = listItem.jsonData as Prisma.JsonObject;

    const diff = getObjectDiff(jsonData, data);

    const jsonDataWithUpdatedJsonData = {
      ...jsonData,
      updatedJsonData: diff,
    };

    const { isAnnualReview = false } = value.metadata;
    const event = isAnnualReview ? EVENTS.CHECK_ANNUAL_REVIEW(diff) : EVENTS.EDITED(diff);
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

    return res.status(204).send();
  } catch (e) {
    logger.error(`ingestPutController Error: ${e.message}`);
    /**
     * TODO:- Queue?
     */

    return res.status(422).send({ message: "List item failed to update" });
  }
}
