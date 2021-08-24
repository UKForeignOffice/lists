/* eslint-disable @typescript-eslint/no-misused-promises */
import express from "express";
import { feedbackIngest, feedbackRoutes,  } from "server/controllers/feedback";

const router = express.Router();

router.post(feedbackRoutes.post, feedbackIngest);

export default router;
