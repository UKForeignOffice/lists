/* eslint-disable @typescript-eslint/no-misused-promises */
import { findListItemById } from "server/models/listItem";
import { HttpException } from "server/middlewares/error-handlers";
import { serviceTypeDetailsHeading } from "./helpers";
import { logger } from "server/services/logger";
import * as controllers from "./controllers";
import { updateRouter } from "./item/update/updateRouter";
import express from "express";
import { listItemsIndexController } from "./listItemsIndexController";

export const listItemsRouter = express.Router();

listItemsRouter.get("/:listId/items", listItemsIndexController);

listItemsRouter.param("listItemId", async (req, res, next, listItemId) => {
  try {
    const listItemIdAsNumber = Number(listItemId);
    const listItem = await findListItemById(listItemIdAsNumber);

    if (!listItem) {
      // TODO: should be handled by router.param
      const err = new HttpException(404, "404", `Could not find list item ${listItemId}`);
      next(err);
      return;
    }

    res.locals.listItem = listItem;
    res.locals.listItemUrl = `${res.locals.listIndexUrl}/${listItemId}`;
    const list = res.locals.list;
    res.locals.title = `${serviceTypeDetailsHeading[list.type]} in ${list.country.name} details`;

    next();
    return;
  } catch (e) {
    const error = new HttpException(404, "404", `list item ${listItemId} could not be found on ${res.locals.list.id}`);
    logger.error(error.message, { stack: e, route: `${req.path}` });
    next(e);
  }
});

listItemsRouter.get("/:listId/items/:listItemId", controllers.checkSuccessfulEdit, controllers.listItemGetController);
listItemsRouter.post("/:listId/items/:listItemId", controllers.listItemPostController);

listItemsRouter.use("/:listId/items/:listItemId", updateRouter);

listItemsRouter.post("/:listId/publisher-delete", controllers.listPublisherDelete);
