import express from "express";
import { ingestPostController } from "./ingestPostController";
import { ingestPutController } from "./ingestPutController";

export const ingestRouter = express.Router();

ingestRouter.post("/ingest/:serviceType", ingestPostController);
ingestRouter.put("/ingest/:serviceType/:id", ingestPutController);
