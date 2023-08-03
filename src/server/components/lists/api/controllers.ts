import type { Request, Response } from "express";
import Joi from "joi";
import { prisma } from "server/models/db/prisma-client";
import { logger } from "server/services/logger";

export async function listsApiPostController(req: Request, res: Response) {
  const receivedData = {
    type: req.body.type as "funeralDirectors" | "translatorsInterpreters" | "lawyers",
    country: req.body.country as string,
  };

  const { error } = receivedDataSchema.validate(receivedData);

  if (error) {
    logger.error(`listsApiPostController schema validation error: ${error.details[0].message}`);
    res.status(400);
    return;
  }

  try {
    const result = await prisma.list.findFirst({
      where: {
        type: receivedData.type,
        country: {
          name: receivedData.country,
        },
      },
    });

    if (!result) {
      res.sendStatus(404);
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
