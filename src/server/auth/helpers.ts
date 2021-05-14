import { Express, Request, Response, NextFunction } from "express";
import passport from "./passport";
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

export function configureAuth(server: Express): void {
  server.use(passport.initialize());
  server.use(passport.session());
  server.use(authRouter);
}
