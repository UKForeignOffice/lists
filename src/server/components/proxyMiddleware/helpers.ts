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

export const serviceTypeSchema = Joi.string<"lawyers" | "funeral-directors">().valid("lawyers", "funeral-directors");
