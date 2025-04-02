import type { NextFunction, Request, Response } from "express";
import { isGovUKEmailAddress, isValidEmailAddress } from "server/utils/validation";
import { sendAuthenticationEmail } from "server/services/govuk-notify";
import { createAuthenticationPath } from "./json-web-token";
import { authRoutes } from "./routes";
import passport from "./passport";
import { isDevMode, isLocalHost, isSmokeTest, SERVICE_DOMAIN } from "server/config";
import { logger } from "server/services/logger";
import crypto from "crypto";

export const authController = passport.authenticate("jwt", {
  successReturnToOrRedirect: "/dashboard/lists",
  failureRedirect: `${authRoutes.login}?invalidToken=true`,
});

function isTokenValid(providedToken: string, expectedToken: string): boolean {
  const providedBuffer = Buffer.from(providedToken, "utf-8");
  const expectedBuffer = Buffer.from(expectedToken, "utf-8");

  if (providedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(providedBuffer, expectedBuffer);
}

export function getLoginController(req: Request, res: Response, next: NextFunction): void {
  const { token } = req.params;
  const { invalidToken, token: tokenParam } = req.query;

  if (token !== undefined) {
    const redirectToLogin = `${authRoutes.login}?token=${encodeURIComponent(token)}`;
    res.redirect(redirectToLogin);
    return;
  }

  if (tokenParam !== undefined) {
    next();
    return;
  }

  const invalidTokenFlag = invalidToken && isTokenValid(invalidToken as string, "true");

  res.render("login", {
    invalidToken: invalidTokenFlag,
  });
}

export async function postLoginController(req: Request, res: Response, next: NextFunction): Promise<void> {
  const emailAddress = req.body.emailAddress?.trim();

  if (!isValidEmailAddress(emailAddress) || !isGovUKEmailAddress(emailAddress)) {
    logger.info(`${emailAddress} attempted to log in but is an invalid email address`);
    res.render("login", {
      error: true,
    });
    return;
  }

  try {
    const protocol = isLocalHost ? "http" : "https";
    const authPath = await createAuthenticationPath({ email: emailAddress });
    const authLink = `${protocol}://${SERVICE_DOMAIN}${authPath}`;
    const skipEmailLogin = isLocalHost || isSmokeTest || isDevMode;

    if (skipEmailLogin) {
      res.redirect(authLink);
      return;
    }

    await sendAuthenticationEmail(emailAddress, authLink);
    res.render("login", {
      success: true,
      emailAddress,
    });
  } catch (e) {
    logger.error("postLoginController", e);
    next(e);
  }
}

export function getLogoutController(req: Request, res: Response, next: NextFunction): void {
  const logoutCallback = (err: Error) => {
    err ? next(err) : res.redirect("/login");
  };
  req.logout(logoutCallback);
}
