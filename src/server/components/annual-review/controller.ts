import { Request, Response, NextFunction } from "express";
import * as Types from "../dashboard/listsItems/types";
import { findListItemByReference } from "server/models/listItem/listItem";
import { getDetailsViewModel } from "server/components/dashboard/listsItems/getViewModel";

import type { ListItemGetObject } from "server/models/types";


export async function confirm(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { listItemRef } = req.params;
    const listItem: ListItemGetObject = await findListItemByReference(listItemRef);
    const rows = formatDataForSummaryRows(listItem);

    res.render("annual-review/provider-confirmation", {rows});
  } catch (err) {
    next(err);
  }
}

function formatDataForSummaryRows(listItem: ListItemGetObject): Types.govukRow[] {
  const { organisation, contact, adminUseOnly } = getDetailsViewModel(listItem);
  const mergedRows = [...organisation.rows, ...contact.rows, ...adminUseOnly.rows ];

  return mergedRows;
}
