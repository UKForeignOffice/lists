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

export function getServiceTypeFromUrl(url: string): string | undefined {
  if (url.includes("application/lawyers")) {
    return "lawyers";
  }
  if (url.includes("application/funeral-directors")) {
    return "funeral-directors";
  }
  if (url.includes("application/translators-interpreters")) {
    return "translators-interpreters";
  }
}
