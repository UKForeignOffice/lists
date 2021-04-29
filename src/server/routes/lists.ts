import express from "express";
import {
  listsRoutes,
  listRedirectToLawyersController,
  // listsStartPageController,
  listsGetController,
  listsResultsController,
  listsPostController,
  professionalApplicationIngestionController,
} from "server/controllers/lists";

const router = express.Router();

// Temporary redirect to lawyers start page
// router.get(listsRoutes.start, listsStartPageController);
router.get(listsRoutes.start, listRedirectToLawyersController);
router.get(listsRoutes.finder, listsGetController);
router.post(listsRoutes.finder, listsPostController);
// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.get(listsRoutes.results, listsResultsController);
router.post(
  listsRoutes.formRunnerWebhook,
  professionalApplicationIngestionController
);

export default router;
