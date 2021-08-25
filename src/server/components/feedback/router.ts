/* eslint-disable @typescript-eslint/no-misused-promises */
import express from "express";
import { feedbackIngest } from "./controllers";
import { feedbackRoutes } from "./routes";

export const feedbackRouter = express.Router();

feedbackRouter.post(feedbackRoutes.postFeedback, feedbackIngest);
