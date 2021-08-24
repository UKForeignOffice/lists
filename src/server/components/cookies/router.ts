import express from "express";
import {
  cookiesPageRoute,
  cookiesGETController,
  cookiesPOSTController,
} from "server/components/cookies";

export const router = express.Router();

router.get(cookiesPageRoute, cookiesGETController);
router.post(cookiesPageRoute, cookiesPOSTController);
