import { prisma } from "server/models/db/prisma-client";
import Joi from "joi";

export async function listExists(country: string, type: string) {
  return await prisma.list.findFirst({
    where: {
      country: {
        name: {
          equals: country,
          mode: "insensitive",
        },
      },
      type: {
        equals: type,
      },
    },
  });
}

export const serviceTypeSchema = Joi.object({
  serviceType: Joi.string().valid("lawyers", "funeral-directors", "translators-interpreters"),
});
