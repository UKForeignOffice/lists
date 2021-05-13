import { Express, Request, Response, NextFunction } from "express";
import passport from "./passport";
import { authRoutes } from "./constants";

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
}

export const authController = passport.authenticate("jwt", {
  successReturnToOrRedirect: "/dashboard", // TODO: ???
  failureRedirect: `${authRoutes.login}?incorrectToken=true`,
});
