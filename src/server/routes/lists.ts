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
} from "server/controllers/lists";

const router = express.Router();

router.get(listsRoutes.finder, listsGetController);
router.post(listsRoutes.finder, listsPostController);
router.get(listsRoutes.results, listsResultsController);
router.post(listsRoutes.formRunnerWebhook, listsDataIngestionController);
router.get(listsRoutes.confirmApplication, listsConfirmApplicationController);
router.get(listsRoutes.privateBeta, listsGetPrivateBetaPage);
router.post(listsRoutes.feedback, listsFeedbackPost);
router.get(listsRoutes.feedbackSuccess, listsFeedbackSuccess);

export default router;
