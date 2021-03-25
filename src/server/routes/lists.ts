import express from "express";
import {
  listRedirectToLawyersController,
  // listsFinderStartPageController,
  listsFinderGetController,
  listsFinderResultsController,
  listsFinderPostController,
  listsFinderStartRoute,
  listsFinderFormRoute,
  listsFinderResultsRoute,
} from "server/controllers/lists";

const router = express.Router();

// start page
// Temporary redirect to lawyers start page
// router.get(listsFinderStartRoute, listsFinderStartPageController);
router.get(listsFinderStartRoute, listRedirectToLawyersController);

// questions page
router.get(listsFinderFormRoute, listsFinderGetController);
router.post(listsFinderFormRoute, listsFinderPostController);

// results page
// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.get(listsFinderResultsRoute, listsFinderResultsController);

export default router;
