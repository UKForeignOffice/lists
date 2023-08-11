import type { Express, Request, Response, NextFunction } from "express";
import { configurePassport } from "./passport";
import { authRoutes } from "./routes";
import { authRouter } from "./router";
import { isSmokeTest } from "server/config";
import { HttpException } from "server/middlewares/error-handlers";
import { configureRateLimit } from "server/middlewares";

export function ensureAuthenticated(req: Request, res: Response, next: NextFunction): void {
  if (req.isAuthenticated() || isSmokeTest) {
    next();
  } else {
    req.session.returnTo = req.originalUrl;
    res.redirect(authRoutes.login);
  }
}

export function ensureUserIsAdministrator(req: Request, _res: Response, next: NextFunction): void {
  if (req.isAuthenticated() && req.user.isAdministrator) {
    next();
  } else {
    const err = new HttpException(405, "405", "Not allowed, only super administrators can access this page");
    next(err);
  }
}

export async function initAuth(server: Express): Promise<void> {
  await configurePassport(server);
  configureRateLimit(server);
  server.use(authRouter);
}
