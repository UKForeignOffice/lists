import { NextFunction, Request, Response } from "express";
import { isGovUKEmailAddress } from "server/utils/validation";
import { sendAuthenticationEmail } from "server/services/govuk-notify";
import { createAuthenticationPath } from "./json-web-token";
import { authRoutes } from "./routes";
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

  postLoginController(req, res, next);

  /*res.render("login", {
    invalidToken: invalidToken === "true",
  });*/
}

export async function postLoginController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  // const emailAddress = req.body.emailAddress?.trim();
  const emailAddress = "jen@cautionyourblast.com";
  if (isGovUKEmailAddress(emailAddress)) {
    const authenticationPath = await createAuthenticationPath({
      email: emailAddress,
    });
    const protocol = isLocalHost ? "http" : "https";
    const authenticationLink = `${protocol}://${SERVICE_DOMAIN}${authenticationPath}`;
    if (isLocalHost) {
      logger.warn(authenticationLink);
      return res.redirect(authenticationLink);
    }

    return res.render("login", {
      success: true,
    });
  } else {
    return res.render("login", {
      error: true,
    });
  }
}

export function getLogoutController(req: Request, res: Response): void {
  req.logout();
  res.redirect("/login");
}
