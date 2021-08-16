import express from "express";
import {
  cookiesPageRoute,
  cookiesGETController,
  cookiesPOSTController,
} from "server/controllers/cookies";

const router = express.Router();

router.get(cookiesPageRoute, cookiesGETController);
router.post(cookiesPageRoute, cookiesPOSTController);

export default router;
