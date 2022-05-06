import { Request, Response } from "express";
import {
  CovidTestSupplierFormWebhookData,
  formRunnerPostRequestSchema,
  LawyersFormWebhookData,
  parseFormRunnerWebhookObject,
} from "server/components/formRunner";
import { logger } from "server/services/logger";
import { prisma } from "server/models/db/prisma-client";
import { recordListItemEvent } from "server/models/audit";
import { AuditEvent, ListItemEvent, Prisma, Status } from "@prisma/client";
import { WebhookDataAsJsonObject } from "server/models/types";
import { recordEvent } from "server/models/listItem/listItemEvent";

export async function ingestPutController(
  req: Request,
  res: Response
): Promise<void> {
  const id = req.params.id;
  const { value, error } = formRunnerPostRequestSchema.validate(
    req.body ?? {},
    {
      abortEarly: true,
    }
  );

  if (error) {
    res.status(400).json(error).end();
    return;
  }
  const data = parseFormRunnerWebhookObject<
    WebhookDataAsJsonObject<LawyersFormWebhookData> | WebhookDataAsJsonObject<CovidTestSupplierFormWebhookData>
  >(value);

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
        history: true
      }
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
      recordListItemEvent({
          eventName: "edit",
          itemId: Number(id),
        },
        AuditEvent.EDITED
      ),
      recordEvent({
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
