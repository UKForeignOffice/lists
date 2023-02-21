import { NextFunction, Request, Response } from "express";
import { isGovUKEmailAddress, isValidEmailAddress } from "server/utils/validation";
import { sendAuthenticationEmail } from "server/services/govuk-notify";
import { createAuthenticationPath } from "./json-web-token";
import { authRoutes } from "./routes";
import passport from "./passport";
import { isCybDev, isLocalHost, isSmokeTest, SERVICE_DOMAIN } from "server/config";
import { logger } from "server/services/logger";

export const authController = passport.authenticate("jwt", {
  successReturnToOrRedirect: "/dashboard/lists",
  failureRedirect: `${authRoutes.login}?invalidToken=true`,
});

export function getLoginController(req: Request, res: Response, next: NextFunction): void {
  const { token } = req.params;
  const { invalidToken, token: tokenParam } = req.query;

  if (token !== undefined) {
    const redirectToLogin = `${authRoutes.login}?token=${token}`;
    return res.redirect(redirectToLogin);
  }
  if (tokenParam !== undefined) {
    return next();
  }

  res.render("login", {
    invalidToken: invalidToken === "true",
  });
}

export async function postLoginController(req: Request, res: Response, next: NextFunction): Promise<void> {
  const emailAddress = req.body.emailAddress?.trim();

  if (!isValidEmailAddress(emailAddress)) {
    res.render("login", {
      error: true,
    });
    return;
  }

  if (!isGovUKEmailAddress(emailAddress)) {
    res.render("login", {
      success: true,
    });
    logger.info("Non GOV.UK email entered");
    return;
  }
  try {
    const protocol = isLocalHost ? "http" : "https";
    const authPath = await createAuthenticationPath({ email: emailAddress });
    const authLink = `${protocol}://${SERVICE_DOMAIN}${authPath}`;

    if (isLocalHost || isSmokeTest || isCybDev) {
      res.redirect(authLink);
      return;
    }

    await sendAuthenticationEmail(emailAddress, authLink);
    res.render("login", {
      success: true,
    });
  } catch (e) {
    logger.error("postLoginController", e);
    next(e);
  }
}

export function getLogoutController(req: Request, res: Response, next: NextFunction): void {
  const logoutCallback = (err: Error) => (err ? next(err) : res.redirect("/login"));
  req.logout(logoutCallback);
}
