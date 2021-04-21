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

router.post("/lists/submit", (req, res) => {
  // TODO
  res.json({ reference: 123 });
});

export default router;
