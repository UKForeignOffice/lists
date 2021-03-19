import express from "express";
import { serviceFinderStartPage, serviceFinderController } from "server/controllers/service-finder";

const router = express.Router();

router.get("/service-finder", serviceFinderStartPage);
router.get("/service-finder/find", serviceFinderController);
router.post("/service-finder/find", serviceFinderController);

export default router
