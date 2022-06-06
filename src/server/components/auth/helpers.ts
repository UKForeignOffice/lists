import { Express, Request, Response, NextFunction } from "express";
import { configurePassport } from "./passport";
import { authRoutes } from "./routes";
import { authRouter } from "./router";
import { configureExpressSession } from "./express-session";
import { isSmokeTest } from "server/config";

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
    res.status(405).send("Not allowed");
  }
}

export async function initAuth(server: Express): Promise<void> {
  await configureExpressSession(server);
  await configurePassport(server);
  server.use(authRouter);
}
