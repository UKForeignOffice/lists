import express from "express";
import {
  serviceFinderStartPage,
  serviceFinderController,
  serviceFinderResultsController,
  serviceFinderPostController,
} from "server/controllers/service-finder";

export const finderStartRoute = "/service-finder";
export const finderFormRoute = "/service-finder/find";
export const finderResultsRoute = "/service-finder/results";

const router = express.Router();

// start page
router.get(finderStartRoute, serviceFinderStartPage);

// questions page
router.get(finderFormRoute, serviceFinderController);
router.post(finderFormRoute, serviceFinderPostController);

// results page
router.get(finderResultsRoute, serviceFinderResultsController);

export default router;
