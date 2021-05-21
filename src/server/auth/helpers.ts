import { Express, Request, Response, NextFunction } from "express";
import { configurePassport } from "./passport";
import { authRoutes } from "./constants";
import authRouter from "./routes";

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

export async function configureAuth(server: Express): Promise<void> {
  await configurePassport(server);
  server.use(authRouter);
}
