import { Express, Request, Response, NextFunction } from "express";
import { configurePassport } from "./passport";
import { authRoutes } from "./routes";
import { authRouter } from "./router";
import { configureExpressSession } from "./express-session";
import { isSmokeTest } from "server/config";
import { HttpException } from "server/middlewares/error-handlers";
import { logger } from "server/services/logger";

export function ensureAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (req.isAuthenticated() || isSmokeTest) {
    next();
  } else {
    req.session.returnTo = req.originalUrl;
    res.redirect(authRoutes.login);
  }
}

export function ensureUserIsSuperAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (req.isAuthenticated() && req.user.isSuperAdmin()) {
    next();
  } else {
    const err = new HttpException(405, "405", "Not allowed");
    return next(err);
  }
}

export async function initAuth(server: Express): Promise<void> {
  try {
    await configureExpressSession(server);
    await configurePassport(server);
    server.use(authRouter);
  } catch (error) {
    logger.error(`initAuth: Error ${(error as Error).message}`);
  }
}
