import express from "express";
import {
  serviceFinderStartPage,
  serviceFinderController,
  serviceFinderResultsController,
  serviceFinderPostController,
} from "server/controllers/service-finder";

const router = express.Router();

// start page
router.get("/service-finder", serviceFinderStartPage);

// questions page
router.get("/service-finder/find", serviceFinderController);
router.post("/service-finder/find", serviceFinderPostController);

// results page
router.get("/service-finder/results", serviceFinderResultsController);

export default router;
