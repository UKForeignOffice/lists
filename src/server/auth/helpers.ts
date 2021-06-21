import { Express, Request, Response, NextFunction } from "express";
import { configurePassport } from "./passport";
import { authRoutes } from "./constants";
import authRouter from "./routes";
import { configureExpressSession } from "./express-session";

export function ensureAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (req.isAuthenticated()) {
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

export async function configureAuth(server: Express): Promise<void> {
  await configureExpressSession(server);
  await configurePassport(server);
  server.use(authRouter);
}
