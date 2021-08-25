import express from "express";
import {
  authController,
  getLoginController,
  postLoginController,
  getLogoutController,
} from "./controllers";
import { authRoutes } from "./routes";

export const authRouter = express.Router();

authRouter.get(authRoutes.login, getLoginController, authController);
authRouter.post(authRoutes.login, postLoginController);
authRouter.get(authRoutes.logout, getLogoutController);
