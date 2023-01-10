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

interface getObjectDiffOptions {
  ignore?: string[]; // keys to ignore
}

const defaultOptions: getObjectDiffOptions = {
  ignore: ["metadata", "declaration"],
};

/**
 * Array comparison. Returns a boolean if the array('s values) are unchanged.
 */
function arrayHasChanges(beforeArray: string[], afterArray: string[]) {
  if (beforeArray.length !== afterArray.length) {
    return true;
  }

  return afterArray.every((item) => !beforeArray.includes(item));
}

/**
 * Recursive object comparison, returns the key/value pairs which have changed from beforeObject to afterObject.
 */
function getObjectDiff<T extends { [key: string]: any }>(
  beforeObject: T,
  afterObject: T,
  options = defaultOptions
): Partial<T> {
  const allKeys = Object.keys({ ...beforeObject, ...afterObject }).filter((key) => !options.ignore?.includes?.(key));

  return allKeys.reduce((prev, key) => {
    const beforeValue = beforeObject?.[key];
    const newValue = afterObject?.[key];

    const isObject = typeof beforeValue === "object" && !Array.isArray(beforeValue);
    const isArray = Array.isArray(beforeValue);
    let nestedDiff;

    if (isObject) {
      nestedDiff = getObjectDiff(beforeValue, newValue);
    }

    if (isArray) {
      nestedDiff = arrayHasChanges(beforeValue, newValue) ? newValue : beforeValue;
    }

    const valueDidChange = newValue && beforeValue !== newValue;

    return {
      ...prev,
      ...(valueDidChange && { [key]: nestedDiff ?? newValue }),
    };
  }, {});
}

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
    logger.error(`request could not be processed - post data could not be parsed ${error}`);
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
