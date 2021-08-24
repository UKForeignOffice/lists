/* eslint-disable @typescript-eslint/no-misused-promises */
import express from "express";
import {
  listsRoutes,
  listsGetController,
  listsPostController,
  listsResultsController,
  listsGetPrivateBetaPage,
  listsDataIngestionController,
  listsConfirmApplicationController,
} from "server/components/lists";

const router = express.Router();

router.get(listsRoutes.finder, listsGetController);
router.post(listsRoutes.finder, listsPostController);
router.get(listsRoutes.results, listsResultsController);
router.post(listsRoutes.formRunnerWebhook, listsDataIngestionController);
router.get(listsRoutes.confirmApplication, listsConfirmApplicationController);
router.get(listsRoutes.privateBeta, listsGetPrivateBetaPage);

export default router;
