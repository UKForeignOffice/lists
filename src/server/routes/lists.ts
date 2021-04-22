import express from "express";
import {
  listRedirectToLawyersController,
  // listsStartPageController,
  listsGetController,
  listsResultsController,
  listsPostController,
  listsFinderStartRoute,
  listsFinderFormRoute,
  listsFinderResultsRoute,
  listsFormRunnerApplicationRoute,
  listFormRunnerApplicationController,
} from "server/controllers/lists";

const router = express.Router();

// start page
// Temporary redirect to lawyers start page
// router.get(listsFinderStartRoute, listsStartPageController);
router.get(listsFinderStartRoute, listRedirectToLawyersController);

// questions page
router.get(listsFinderFormRoute, listsGetController);
router.post(listsFinderFormRoute, listsPostController);

// results page
// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.get(listsFinderResultsRoute, listsResultsController);

// lists application forms processing
router.post(
  listsFormRunnerApplicationRoute,
  listFormRunnerApplicationController
);

export default router;
