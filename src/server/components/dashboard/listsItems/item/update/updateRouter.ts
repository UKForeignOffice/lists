/* eslint-disable @typescript-eslint/no-misused-promises */

import express from "express";
import * as controllers from "server/components/dashboard/listsItems/controllers";

export const updateRouter = express.Router();

/**
 * TODO: ref to /:listItemId/:action?
 */
updateRouter.post("/:listId/items/:listItemId/delete", controllers.listItemDeleteController);
updateRouter.post("/:listId/items/:listItemId/publish", controllers.listItemPublishController);
updateRouter.post("/:listId/items/:listItemId/changes", controllers.listItemRequestChangeController);
updateRouter.post("/:listId/items/:listItemId/update", controllers.listItemUpdateController);
updateRouter.post("/:listId/items/:listItemId/pin", controllers.listItemPinController);
updateRouter.post("/:listId/publisher-delete", controllers.listPublisherDelete);
