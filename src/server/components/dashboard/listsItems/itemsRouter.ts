/* eslint-disable @typescript-eslint/no-misused-promises */
import {csrfRequestHandler} from "server/components/cookies/helpers";
import {
  listsController,
  listsEditController,
  listsItemsController
} from "server/components/dashboard/controllers";
import * as controllers from "server/components/dashboard/listsItems/controllers";

import { logger } from "server/services/logger";
import express from "express";
import {getListOverview, redirectIfUnauthorised} from "server/components/dashboard/listsItems/helpers";
import {ensureAuthenticated} from "server/components/auth";
import {findListItemById} from "server/models/listItem";
import {HttpException} from "server/middlewares/error-handlers";

export const listRouter = express.Router();

listRouter.all(`*`, ensureAuthenticated, csrfRequestHandler);
listRouter.get('/', listsController);

listRouter.param('listId',  async (req, res, next, listId) => {
  try {
    const listIdAsNumber = Number(listId)
    res.locals.list = await getListOverview(listIdAsNumber);
    res.locals.listIndexUrl = `${req.baseUrl}/${listId}/items`;
    return next();
  } catch (e) {
    logger.error(`${req.path} - Assigning listId ${listId} to req failed, ${e}`)
    return next(e)
  }
})

listRouter.all("/:listId", listsEditController);
listRouter.all("/:listId/*", redirectIfUnauthorised);

listRouter.get("/:listId/items", listsItemsController);

listRouter.param('listItemId', async (req, res, next, listItemId) => {
  try {
    const listItemIdAsNumber = Number(listItemId);
    res.locals.listItem = await findListItemById(listItemIdAsNumber);
    res.locals.listItemUrl = `${res.locals.listIndexUrl}/${listItemId}`
    return next()
  } catch (e) {
    const error = new HttpException(404, "404", `list item ${listItemId} could not be found on ${res.locals.list.id}`);
    logger.error(error.message, {stack: e, route: `${req.path}`})
    return next(e)
  }
})

listRouter.get('/:listId/items/:listItemId', controllers.listItemGetController);
listRouter.post('/:listId/items/:listItemId', controllers.listItemPostController);

/**
 * TODO: ref to /:listItemId/:action?
 */
listRouter.post('/:listId/items/:listItemId/delete', controllers.listItemDeleteController);
listRouter.post('/:listId/items/:listItemId/publish', controllers.listItemPublishController);
listRouter.post('/:listId/items/:listItemId/changes', controllers.listItemRequestChangeController);
listRouter.post('/:listId/items/:listItemId/update', controllers.listItemUpdateController);
listRouter.post('/:listId/items/:listItemId/pin', controllers.listItemPinController);
