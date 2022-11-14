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

interface FormData {
  name: string;
  fees: string;
  questions: Array<Record<string, string | number | Array<Record<string, string | boolean>>>>;
  metadata: Record<string, string | boolean>;
}

export async function ingestPutController(req: Request, res: Response): Promise<void> {
  const id = req.params.id;
  const serviceType = getServiceTypeName(req.params.serviceType) as ServiceType;
  const fromAnnualReview = req.body.name.includes("annual-review");
  const bodyData = fromAnnualReview ? addDeclarationData(req.body) : req.body;
  const { value, error } = formRunnerPostRequestSchema.validate(bodyData);

  if (!serviceType || !(serviceType in ServiceType)) {
    res.status(500).json({
      error: "serviceType is incorrect, please make sure form's webhook output configuration is correct",
    });
    return;
  }

  if (error) {
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

    const jsonData = listItem?.jsonData as Prisma.JsonObject;
    const jsonDataWithUpdatedJsonData = {
      ...jsonData,
      updatedJsonData: data,
    };

    const listItemPrismaQuery: Prisma.ListItemUpdateArgs = {
      where: { id: Number(id) },
      data: {
        status: Status.EDITED,
        history: {
          create: EVENTS.EDITED(data),
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

    res.status(204).send();
    return;
  } catch (e) {
    logger.error(`ingestPutController Error: ${e.message}`);
    /**
     * TODO:- Queue?
     */

    return res.status(422).send({ message: "List item failed to update" });
  }
}

function addDeclarationData(data: FormData): FormData {
  const declaration = {
    question: "Declaration",
    index: 0,
    fields: [{ key: "declaration", title: "Declaration", type: "boolean", answer: true }],
  };
  data.questions.pop();
  data.questions.push(declaration);

  return data;
}
