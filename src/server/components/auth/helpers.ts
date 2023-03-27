import { Express, Request, Response, NextFunction } from "express";
import { configurePassport } from "./passport";
import { authRoutes } from "./routes";
import { authRouter } from "./router";
import { configureExpressSession } from "./express-session";
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

export function ensureUserIsAdministrator(req: Request, res: Response, next: NextFunction): void {
  if (req.isAuthenticated() && req.user.isAdministrator) {
    next();
  } else {
    const err = new HttpException(405, "405", "Not allowed");
    return next(err);
  }
}

export function onlyAllowAdminsEditAnnualReviewDate(req: Request, res: Response, next: NextFunction) {
  if(req.user?.isAdministrator) {
    return next();
  }

  req.flash("error", "You do not have permissions to edit the annual review date");
  return res.redirect(res?.locals.listsEditUrl);
}

export async function initAuth(server: Express): Promise<void> {
  await configureExpressSession(server);
  await configurePassport(server);
  configureRateLimit(server);
  server.use(authRouter);
}
