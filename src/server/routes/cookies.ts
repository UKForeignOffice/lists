import express from "express";
import {
  cookiesPageRoute,
  cookiesPageGETController,
  cookiesPagePOSTController,
} from "server/controllers/cookies";

const router = express.Router();

router.get(cookiesPageRoute, cookiesPageGETController);
router.post(cookiesPageRoute, cookiesPagePOSTController);

export default router;
