/* eslint-disable @typescript-eslint/no-misused-promises */

import express from "express";
import * as confirmController from "./controllers.confirm";
export const updateRouter = express.Router();

updateRouter.get("/confirm", confirmController.get);
updateRouter.post("/confirm", confirmController.post);
