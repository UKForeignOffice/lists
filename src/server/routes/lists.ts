import express from "express";
import {
  listsRoutes,
  listsGetController,
  listsPostController,
  listsResultsController,
  // listsStartPageController,
  listsDataIngestionController,
  listRedirectToLawyersController,
} from "server/controllers/lists";

const router = express.Router();

// Temporary redirect to lawyers start page
// router.get(listsRoutes.start, listsStartPageController);
router.get(listsRoutes.start, listRedirectToLawyersController);
router.get(listsRoutes.finder, listsGetController);
router.post(listsRoutes.finder, listsPostController);
router.get(listsRoutes.results, listsResultsController);
router.post(listsRoutes.formRunnerWebhook, listsDataIngestionController);

export default router;
