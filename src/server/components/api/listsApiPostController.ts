import type { Request, Response } from "express";
import Joi from "joi";
import { prisma } from "server/models/db/prisma-client";
import { logger } from "server/services/logger";

export async function listsApiPostController(req: Request, res: Response) {
  const { value, error } = schema.validate(req.body, { stripUnknown: true });

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
      logger.error(`listsApiPostController error: No list found for ${value.type} in ${value.country}`);
      res.status(400).send("No list found");
      return;
    }

    logger.info(`listsApiPostController: ${value.type} in ${value.country} has been accessed`);
    res.sendStatus(200);
  } catch (error) {
    logger.error(`listsApiPostController error: ${error}`);
    res.sendStatus(500);
  }
}

const schema = Joi.object({
  type: Joi.string().valid("funeralDirectors", "translatorsInterpreters", "lawyers").required(),
  country: Joi.string().required(),
});
