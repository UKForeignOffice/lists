import { NextFunction, Request, Response } from "express";
import { isGovUKEmailAddress } from "server/utils/validation";
import { sendAuthenticationEmail } from "server/services/govuk-notify";
import { createAuthenticationPath } from "./json-web-token";
import { authRoutes } from "./constants";
import passport from "./passport";
import { isLocalHost, SERVICE_DOMAIN } from "server/config";
import { logger } from "server/services/logger";

export const authController = passport.authenticate("jwt", {
  successReturnToOrRedirect: "/dashboard",
  failureRedirect: `${authRoutes.login}?invalidToken=true`,
});

export function getLoginController(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { invalidToken, token } = req.query;

  if (token !== undefined) {
    return next();
  }

  res.render("login", {
    invalidToken: invalidToken === "true",
  });
}

export function postLoginController(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const emailAddress = req.body.emailAddress?.trim();

  if (isGovUKEmailAddress(emailAddress)) {
    createAuthenticationPath({ email: emailAddress })
      .then((authPath) => {
        const protocol = isLocalHost ? "http" : "https";
        return `${protocol}://${SERVICE_DOMAIN}${authPath}`;
      })
      .then(async (authLink) => {
        if (isLocalHost) {
          logger.warn(authLink);
        }
        return await sendAuthenticationEmail(emailAddress, authLink);
      })
      .then(() => {
        res.render("login", {
          success: true,
        });
      })
      .catch(next);
  } else {
    res.render("login", {
      error: true,
    });
  }
}

export function getLogoutController(req: Request, res: Response): void {
  req.logout();
  res.redirect("/login");
}
