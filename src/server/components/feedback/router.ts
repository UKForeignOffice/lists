/* eslint-disable @typescript-eslint/no-misused-promises */
import express from "express";
import { feedbackIngest } from "./feedback";

export const feedbackRoutes = {
  postFeedback: "/feedback"
}

export const feedbackRouter = express.Router();

feedbackRouter.post(feedbackRoutes.postFeedback, feedbackIngest);
