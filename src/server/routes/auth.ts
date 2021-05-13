import express from "express";
import {
  getLoginController,
  postLoginController,
  getLogoutController,
} from "server/controllers/auth";
import { authController, authRoutes } from "server/services/auth";

const router = express.Router();

router.get(authRoutes.login, getLoginController, authController);
router.post(authRoutes.login, postLoginController);
router.get(authRoutes.logout, getLogoutController);

export default router;
