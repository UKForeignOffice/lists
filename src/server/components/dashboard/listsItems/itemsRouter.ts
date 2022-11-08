/* eslint-disable @typescript-eslint/no-misused-promises */
import {csrfRequestHandler} from "server/components/cookies/helpers";
import {
  listsController,
  listsEditController,
  listsItemsController
} from "server/components/dashboard/controllers";
import {redirectIfUnauthorised} from "server/components/dashboard/listsItems/helpers";
import * as controllers from "server/components/dashboard/listsItems/controllers";

import {Country} from "@prisma/client";
import {prisma} from "server/models/db/prisma-client";
import {logger} from "server/services/logger";
import express from "express";
import {ensureAuthenticated} from "server/components/auth";

async function getListItemOverview(id: number): Promise<{id: number, type: string, country: Country } | null> {
  return await prisma.list.findUnique({
    where: { id },
    select: {
      id: true,
      type: true,
      country: true,
      jsonData: false,
    }
  })
}

export const listRouter = express.Router();

listRouter.all(`/*`, ensureAuthenticated, csrfRequestHandler);
listRouter.get('/', ensureAuthenticated, csrfRequestHandler, listsController);

listRouter.param('listId',  async (req, res, next, listId) => {
  try {
    const listIdAsNumber = Number(listId)
    res.locals.list = await getListItemOverview(listIdAsNumber);
    return next();
  } catch (e) {
    logger.error(`${req.path} - Assigning listId ${listId} to req failed, ${e}`)
    next(e)
  }
})

listRouter.all(
  "/:listId",
  listsEditController
);
listRouter.get(
  "/:listId/items",
  listsItemsController
);



// list items
listRouter.all('/:listId/items/*', controllers.listItemEditRequestValidation)
listRouter.get('/:listId/items/:listItemId', controllers.listItemGetController);
listRouter.post('/:listId/items/:listItemId', controllers.listItemDeleteController);
listRouter.post('/:listId/items/:listItemId', controllers.listItemPostController);
listRouter.post('/:listId/items/:listItemId/publish', controllers.listItemPublishController);
listRouter.post('/:listId/items/:listItemId/changes', controllers.listItemRequestChangeController);
listRouter.post('/:listId/items/:listItemId/update', controllers.listItemUpdateController);
listRouter.post('/:listId/items/:listItemId/update', controllers.listItemPinController);
