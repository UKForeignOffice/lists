import {prisma} from "server/models/db/prisma-client";
import {List} from "@prisma/client";
import {ListJsonData} from "server/models/types";

export async function removeListFromAnnualReview(list: List) {
  const jsonData = list.jsonData as ListJsonData;
  delete jsonData.currentAnnualReview;

  return await prisma.list.update({
    where: {
      id: list.id,
    },
    data: {
      isAnnualReview: false,
      jsonData,
    },
  });
}
