import express from "express";
import {
  listsFinderStartPageController,
  listsFinderGetController,
  listsFinderResultsController,
  listsFinderPostController,
  listsFinderStartRoute,
  listsFinderFormRoute,
  listsFinderResultsRoute,
} from "server/controllers/lists";

const router = express.Router();

// start page
router.get(listsFinderStartRoute, listsFinderStartPageController);

// questions page
router.get(listsFinderFormRoute, listsFinderGetController);
router.post(listsFinderFormRoute, listsFinderPostController);

// results page
router.get(listsFinderResultsRoute, listsFinderResultsController);

export default router;
