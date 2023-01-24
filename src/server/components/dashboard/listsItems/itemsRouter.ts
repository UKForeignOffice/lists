/* eslint-disable @typescript-eslint/no-misused-promises */
import { csrfRequestHandler } from "server/components/cookies/helpers";
import {
  listsController,
  listsEditController,
  listsItemsController,
  listsEditPostController,
} from "server/components/dashboard/controllers";
import * as controllers from "server/components/dashboard/listsItems/controllers";
import * as annualReview from "server/components/dashboard/annualReview/controllers";
import * as developmentControllers from "server/components/dashboard/listsItems/controllers.development";

import { logger } from "server/services/logger";
import express from "express";
import { getListOverview, serviceTypeDetailsHeading } from "server/components/dashboard/listsItems/helpers";
import { ensureAuthenticated } from "server/components/auth";
import { findListItemById } from "server/models/listItem";
import { HttpException } from "server/middlewares/error-handlers";
import { validateAccessToList } from "server/components/dashboard/listsItems/validateAccessToList";

export const listRouter = express.Router();

listRouter.all(`*`, ensureAuthenticated, csrfRequestHandler);
listRouter.get("/", listsController);

listRouter.param("listId", async (req, res, next, listId) => {
  if (listId === "new") {
    res.locals.list = {
      id: "new",
    };
    return next();
  }

  try {
    const listIdAsNumber = Number(listId);
    const list = await getListOverview(listIdAsNumber);

    if (!list) {
      const err = new HttpException(404, "404", `Could not find list ${listId}`);
      return next(err);
    }

    res.locals.list = list;
    res.locals.listsEditUrl = `${req.baseUrl}/${listId}`;
    res.locals.listIndexUrl = `${req.baseUrl}/${listId}/items`;
    res.locals.title = `${serviceTypeDetailsHeading[list.type]}s in ${list.country.name}`;
    return next();
  } catch (e) {
    logger.error(`${req.path} - Assigning listId ${listId} to req failed, ${e}`);
    return next(e);
  }
});

listRouter.get("/:listId/development", developmentControllers.get);
listRouter.post("/:listId/development", developmentControllers.post);

listRouter.all("/:listId*", validateAccessToList);

listRouter.get("/:listId", listsEditController);
listRouter.post("/:listId", listsEditPostController);

listRouter.all("/:listId/*", validateAccessToList);

listRouter.get("/:listId/items", listsItemsController);

listRouter.param("listItemId", async (req, res, next, listItemId) => {
  try {
    const listItemIdAsNumber = Number(listItemId);
    const listItem = await findListItemById(listItemIdAsNumber);

    if (!listItem) {
      // TODO: should be handled by router.param
      const err = new HttpException(404, "404", `Could not find list item ${listItemId}`);
      return next(err);
    }

    res.locals.listItem = listItem;
    res.locals.listItemUrl = `${res.locals.listIndexUrl}/${listItemId}`;
    const list = res.locals.list;
    res.locals.title = `${serviceTypeDetailsHeading[list.type]} in ${list.country.name} details`;

    return next();
  } catch (e) {
    const error = new HttpException(404, "404", `list item ${listItemId} could not be found on ${res.locals.list.id}`);
    logger.error(error.message, { stack: e, route: `${req.path}` });
    return next(e);
  }
});

listRouter.get("/:listId/items/:listItemId", controllers.listItemGetController);
listRouter.post("/:listId/items/:listItemId", controllers.listItemPostController);

/**
 * TODO: ref to /:listItemId/:action?
 */
listRouter.post("/:listId/items/:listItemId/delete", controllers.listItemDeleteController);
listRouter.post("/:listId/items/:listItemId/publish", controllers.listItemPublishController);
listRouter.post("/:listId/items/:listItemId/changes", controllers.listItemRequestChangeController);
listRouter.post("/:listId/items/:listItemId/update", controllers.listItemUpdateController);
listRouter.post("/:listId/items/:listItemId/pin", controllers.listItemPinController);
listRouter.post("/:listId/publisher-delete", controllers.listPublisherDelete);

listRouter.get("/:listId/annual-review-date", annualReview.editDateGetController);
listRouter.post("/:listId/annual-review-date", annualReview.editDatePostController);
