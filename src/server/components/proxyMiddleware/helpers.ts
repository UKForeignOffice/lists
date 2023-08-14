import { prisma } from "server/models/db/prisma-client";

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
