import type { Request, Response } from "express";
import Joi from "joi";
import { prisma } from "server/models/db/prisma-client";
import { logger } from "server/services/logger";

export async function listsApiPostController(req: Request, res: Response) {
  const { value, error } = receivedDataSchema.validate(req.body, { stripUnknown: true });

  if (error) {
    logger.error(`listsApiPostController schema validation error: ${error.details[0].message}`);
    res.status(400).send("Bad Request");
    return;
  }

  try {
    const listItem = await prisma.list.findFirst({
      where: {
        type: value.type,
        country: {
          name: value.country,
        },
      },
    });

    if (!listItem) {
      res.status(400).send("No list found");
      return;
    }

    res.sendStatus(200);
  } catch (error) {
    logger.error(`listsApiPostController error: ${error}`);
    res.sendStatus(500);
  }
}

const receivedDataSchema = Joi.object({
  type: Joi.string().valid("funeralDirectors", "translatorsInterpreters", "lawyers").required(),
  country: Joi.string().required(),
});
