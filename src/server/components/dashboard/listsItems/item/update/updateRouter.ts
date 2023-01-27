/* eslint-disable @typescript-eslint/no-misused-promises */

import express from "express";
import * as controllers from "server/components/dashboard/listsItems/controllers";
import { del } from "./controllers.delete";
import * as confirmController from "./controllers.confirm";
export const updateRouter = express.Router();

updateRouter.get("/confirm", confirmController.get);
updateRouter.post("/confirm", confirmController.post);

/**
 * TODO: ref to /:listItemId/:action?
 */
updateRouter.post("/delete", del);
updateRouter.post("/publish", controllers.listItemPublishController);
updateRouter.post("/changes", controllers.listItemRequestChangeController);
updateRouter.post("/update", controllers.listItemUpdateController);
updateRouter.post("/pin", controllers.listItemPinController);
