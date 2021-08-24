import express from "express";
import {
  authController,
  getLoginController,
  postLoginController,
  getLogoutController,
} from "./controllers";
import { authRoutes } from "./constants";

const router = express.Router();

router.get(authRoutes.login, getLoginController, authController);
router.post(authRoutes.login, postLoginController);
router.get(authRoutes.logout, getLogoutController);

export default router;
