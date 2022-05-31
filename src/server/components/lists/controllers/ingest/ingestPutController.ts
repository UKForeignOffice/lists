import { Request, Response } from "express";
import { formRunnerPostRequestSchema } from "server/components/formRunner";
import { logger } from "server/services/logger";
import { prisma } from "server/models/db/prisma-client";
import { recordListItemEvent } from "server/models/audit";
import { AuditEvent, ListItemEvent, Prisma, Status } from "@prisma/client";
import { recordEvent } from "server/models/listItem/listItemEvent";
import { DeserialisedWebhookData } from "server/models/listItem/providers/deserialisers/types";
import _ from "lodash";
import { ServiceType } from "server/models/types";
import { deserialise } from "server/models/listItem/listItemCreateInputFromWebhook";

export async function ingestPutController(
  req: Request,
  res: Response
): Promise<void> {
  const id = req.params.id;
  const serviceType = _.camelCase(req.params.serviceType) as ServiceType;
  const { value, error } = formRunnerPostRequestSchema.validate(req.body);

  if (!(serviceType in ServiceType)) {
    res.status(500).json({
      error:
        "serviceType is incorrect, please make sure form's webhook output configuration is correct",
    });
    return;
  }

  if (error !== undefined) {
    res.status(422).json({ error: error.message });
    return;
  }
  if (value === undefined) {
    res.status(422).json({ error: "request could not be processed - post data could not be parsed" });
    return;
  }

  let data: DeserialisedWebhookData;

  try {
    data = deserialise(value);

  } catch (e) {
    res.status(422).json({ error: "questions could not be deserialised" });
    return;
  }

  const listItemPrismaQuery: Prisma.ListItemUpdateArgs = {
    where: { id: Number(id) },
    data: {
      status: Status.EDITED,
    },
  };

  try {
    const listItem = await prisma.listItem.findUnique({
      where: { id: Number(id) },
      include: {
        history: true,
      },
    });
    if (listItem === undefined) {
      res.status(404).send({
        error: {
          message: `Unable to store updates - listItem could not be found`,
        },
      });
    }
    await prisma.$transaction([
      prisma.listItem.update(listItemPrismaQuery),
      recordListItemEvent(
        {
          eventName: "edit",
          itemId: Number(id),
        },
        AuditEvent.EDITED
      ),
      recordEvent(
        {
          eventName: "edit",
          itemId: Number(id),
          updatedJsonData: data,
        },
        Number(id),
        ListItemEvent.EDITED
      ),
    ]);

    res.status(204).send();
    return;
  } catch (e) {
    logger.error(`listsDataIngestionController Error: ${e.message}`);
    /**
     * TODO:- Queue?
     */

    res.status(422).send({ message: "List item failed to update" });
  }
}
