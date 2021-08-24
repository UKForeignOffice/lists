/* eslint-disable @typescript-eslint/no-misused-promises */
import express from "express";
import {
  listsRoutes,
  listsFeedbackPost,
  listsGetController,
  listsFeedbackSuccess,
  listsPostController,
  listsResultsController,
  listsGetPrivateBetaPage,
  listsDataIngestionController,
  listsConfirmApplicationController,
} from "server/components/lists";

export const listsRouter = express.Router();

listsRouter.get(listsRoutes.finder, listsGetController);
listsRouter.post(listsRoutes.finder, listsPostController);
listsRouter.get(listsRoutes.results, listsResultsController);
listsRouter.post(listsRoutes.formRunnerWebhook, listsDataIngestionController);
listsRouter.get(listsRoutes.confirmApplication, listsConfirmApplicationController);
listsRouter.get(listsRoutes.privateBeta, listsGetPrivateBetaPage);
listsRouter.post(listsRoutes.feedback, listsFeedbackPost);
listsRouter.get(listsRoutes.feedbackSuccess, listsFeedbackSuccess);
