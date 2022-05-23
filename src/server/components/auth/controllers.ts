import { NextFunction, Request, Response } from "express";
import { isGovUKEmailAddress } from "server/utils/validation";
import { sendAuthenticationEmail } from "server/services/govuk-notify";
import { createAuthenticationPath } from "./json-web-token";
import { authRoutes } from "./routes";
import passport from "./passport";
import { isCybDev, isLocalHost, SERVICE_DOMAIN } from "server/config";
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

export async function postLoginController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const emailAddress = req.body.emailAddress?.trim();

  try {
    if (!isGovUKEmailAddress(emailAddress)) {
      res.render("login", {
        error: true,
      });
      return;
    }

    const protocol = isLocalHost ? "http" : "https";

    const authPath = await createAuthenticationPath({ email: emailAddress });
    const authLink = `${protocol}://${SERVICE_DOMAIN}${authPath}`;

    if (isLocalHost || isCybDev) {
      logger.info(`Environment isLocalHost [${isLocalHost}], isCybDev [${isCybDev}], redirecting to auth link [${authLink}]`);
      res.redirect(authLink);
      return;
    }

    logger.info(`Environment is not isLocalHost or isCybDev, emailing auth link`);
    await sendAuthenticationEmail(emailAddress, authLink);
    res.render("login", {
      success: true,
    });
  } catch (e) {
    logger.error("postLoginController", e);
    next(e);
  }
}

export function getLogoutController(req: Request, res: Response): void {
  req.logout();
  res.redirect("/login");
}
