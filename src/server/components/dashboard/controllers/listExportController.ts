import type { NextFunction, Request, Response } from "express";
import type { ListItem } from "server/models/types";
import type { ListItemJsonData } from "server/models/listItem/providers/deserialisers/types";

import { prisma } from "server/models/db/prisma-client";
import { json2csv } from "json-2-csv";
import { Readable } from "node:stream";
import { startCase } from "lodash";
import { format } from "date-fns";
import { logger } from "server/services/logger";
import { AuditEvent } from "@prisma/client";

type ListItemWithJsonData = ListItem & { jsonData: ListItemJsonData };

export async function listExportController(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await prisma.list.findUniqueOrThrow({
      where: {
        id: Number(req.params.listId),
      },
      include: {
        items: true,
        country: true,
      },
    });

    const formattedItems = (result.items as ListItemWithJsonData[]).map(formatForCSV);

    const output = await json2csv(formattedItems, {
      emptyFieldValue: "none provided",
      expandNestedObjects: false,
      excludeKeys: [
        "updatedAt",
        "addressId",
        "listId",
        "metadata",
        "declaration",
        "updatedJsonData",
        "addressCountry",
        "type",
        "country",
      ],
      preventCsvInjection: true,
    });

    const currentDate = new Date();
    const formattedDate = format(currentDate, "yyyy-MM-dd");
    const fileName = `${result?.country.name}-${startCase(result?.type)}-${formattedDate}.csv`;

    const stream = new Readable();
    stream.push(output);
    stream.push(null);
    res.set("Content-Disposition", `attachment; filename=${fileName}`);
    res.set("Content-Type", "text/csv");
    stream.pipe(res);

    logger.info(`List ${result?.id} exported to ${fileName} by ${req.user?.emailAddress}`);

    await prisma.audit.create({
      data: {
        type: "list",
        auditEvent: AuditEvent.LIST_EXPORTED,
        jsonData: {
          listId: Number(req.params.listId),
          userId: req.user?.id,
          userEmail: req.user?.emailAddress,
        },
      },
    });
  } catch (error) {
    logger.error(`listsExportController error: ${error}`);
    next();
  }
}

function formatForCSV(item: ListItemWithJsonData) {
  const { type, jsonData, ...rest } = item;
  const {
    organisationName,
    "address.firstLine": addressFirstLine,
    "address.secondLine": addressSecondLine,
    ...otherFields
  } = jsonData as ListItemJsonData;
  return {
    organisationName,
    ...otherFields,
    addressFirstLine,
    addressSecondLine,
    ...rest,
  };
}
