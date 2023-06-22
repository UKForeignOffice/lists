import { addYears } from "date-fns";
import { prisma } from "scheduler/prismaClient";

export default async function main() {
  // and the last history evenmt is unpublish
  const itemsUnpublishForAYear = await prisma.event.findMany({
    where: {
      type: "UNPUBLISHED",
      time: {
        gte: testFunc(prisma.event.fields.time),
      },
    },
  });
  console.log(itemsUnpublishForAYear);
}

function testFunc(t: any) {
  console.log(t, typeof t);
  return new Date();
}
