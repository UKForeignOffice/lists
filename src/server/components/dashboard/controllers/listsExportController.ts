import type { NextFunction, Request, Response } from "express";
import type { ListItem } from "server/models/types";
import type { ListItemJsonData } from "server/models/listItem/providers/deserialisers/types";

import { prisma } from "server/models/db/prisma-client";
import { json2csv } from "json-2-csv";
import { Readable } from "node:stream";
import { startCase } from "lodash";
import { format } from "date-fns";
import { logger } from "server/services/logger";
import { HttpException } from "server/middlewares/error-handlers";
import { AuditEvent } from "@prisma/client";

type ListWithJsonData = Array<ListItem & { jsonData: ListItemJsonData }>;

export async function listsExportController(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user?.isAdministrator) {
      const err = new HttpException(403, "403", "You do not have permission to exports lists");
      next(err);
      return;
    }

    const [result] = await prisma.$transaction([
      prisma.list.findUnique({
        where: {
          id: Number(req.params.listId),
        },
        include: {
          items: true,
          country: true,
        },
      }),
      prisma.audit.create({
        data: {
          type: "list",
          auditEvent: AuditEvent.LIST_EXPORTED,
          jsonData: {
            listId: Number(req.params.listId),
            userId: req.user?.id,
            userEmail: req.user?.emailAddress,
          },
        },
      }),
    ]);

    const formattedItems = formatProviderData((result?.items as ListWithJsonData) ?? []);

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
  } catch (error) {
    logger.error(`listsExportController error: ${error}`);
    next("An error occurred whilst trying to export the list: ");
  }
}

function formatProviderData(items: ListWithJsonData) {
  return items.map((item) => {
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
  });
}
