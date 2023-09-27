import express from "express";
import { authController, getLoginController, postLoginController, getLogoutController } from "./controllers";
import { authRoutes } from "./routes";

export const authRouter = express.Router();

authRouter.get(authRoutes.loginAuth, getLoginController, authController);
authRouter.get(authRoutes.login, getLoginController, authController);
// eslint-disable-next-line @typescript-eslint/no-misused-promises
authRouter.post(authRoutes.login, postLoginController);
authRouter.get(authRoutes.logout, getLogoutController);
