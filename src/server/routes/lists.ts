/* eslint-disable @typescript-eslint/no-misused-promises */
import express from "express";
import {
  listsRoutes,
  listsGetController,
  listsPostController,
  listsResultsController,
  listsGetPrivateBetaPage,
  // listsStartPageController,
  listsDataIngestionController,
  listRedirectToLawyersController,
  listsConfirmApplicationController,
} from "server/controllers/lists";

const router = express.Router();

// Temporary redirect to lawyers start page
// router.get(listsRoutes.start, listsStartPageController);
router.get(listsRoutes.start, listRedirectToLawyersController);
router.get(listsRoutes.finder, listsGetController);
router.post(listsRoutes.finder, listsPostController);
router.get(listsRoutes.results, listsResultsController);
router.post(listsRoutes.formRunnerWebhook, listsDataIngestionController);
router.get(listsRoutes.confirmApplication, listsConfirmApplicationController);
router.get(listsRoutes.privateBeta, listsGetPrivateBetaPage);

export default router;
