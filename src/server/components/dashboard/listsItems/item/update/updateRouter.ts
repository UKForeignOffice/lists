/* eslint-disable @typescript-eslint/no-misused-promises */

import express from "express";
import { get, post } from "./controllers.confirm";
export const updateRouter = express.Router();

updateRouter.get("/confirm", get);
updateRouter.post("/confirm", post);
