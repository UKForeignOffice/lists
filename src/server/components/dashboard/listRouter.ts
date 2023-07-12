/* eslint-disable @typescript-eslint/no-misused-promises */
import { listsEditController, listsEditPostController, listsController } from "server/components/dashboard/controllers";
import * as annualReview from "server/components/dashboard/annualReview/controllers";
import * as developmentControllers from "server/components/dashboard/listsItems/controllers.development";

import { logger } from "server/services/logger";
import express from "express";
import { getListOverview, serviceTypeDetailsHeading } from "server/components/dashboard/listsItems/helpers";
import { ensureAuthenticated } from "server/components/auth";
import { HttpException } from "server/middlewares/error-handlers";
import { validateAccessToList } from "server/components/dashboard/listsItems/validateAccessToList";
import { listItemsRouter } from "./listsItems/listItemsRouter";
import { relatedLinksRouter } from "server/components/dashboard/relatedLinks/router";

export const listRouter = express.Router();

listRouter.all(`*`, ensureAuthenticated);
listRouter.get("/", listsController);

listRouter.param("listId", async (req, res, next, listId) => {
  if (listId === "new") {
    res.locals.list = {
      id: "new",
    };
    next();
    return;
  }

  try {
    const listIdAsNumber = Number(listId);
    const list = await getListOverview(listIdAsNumber);

    if (!list) {
      const err = new HttpException(404, "404", `Could not find list ${listId}`);
      next(err);
      return;
    }

    res.locals.list = list;
    res.locals.listsEditUrl = `${req.baseUrl}/${listId}`;
    res.locals.listIndexUrl = `${req.baseUrl}/${listId}/items`;
    res.locals.title = `${serviceTypeDetailsHeading[list.type]}s in ${list.country.name}`;
    next();
    return;
  } catch (e) {
    logger.error(`${req.path} - Assigning listId ${listId} to req failed, ${e}`);
    next(e);
  }
});

listRouter.get("/:listId/development", developmentControllers.get);
listRouter.post("/:listId/development", developmentControllers.post);

listRouter.all("/:listId*", validateAccessToList);

listRouter.get("/:listId/annual-review-date", annualReview.editDateGetController);
listRouter.post("/:listId/annual-review-date", annualReview.editDatePostController);

listRouter.get("/:listId", listsEditController);
listRouter.post("/:listId", listsEditPostController);

listRouter.use("/:listId/related-links", relatedLinksRouter);

listRouter.all("/:listId/*", validateAccessToList);

listRouter.use(listItemsRouter);
