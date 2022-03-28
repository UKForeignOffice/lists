/* eslint-disable @typescript-eslint/no-misused-promises */

import express from "express";
import { ingestPostController } from "./ingestPostController";
import { ingestPutController } from "./ingestPutController";
import cors from "cors";

export const ingestRouter = express.Router();

ingestRouter.post("/ingest/:serviceType", cors(), ingestPostController);
ingestRouter.put("/ingest/:serviceType/:id", cors(), ingestPutController);
