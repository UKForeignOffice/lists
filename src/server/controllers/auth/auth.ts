import { NextFunction, Request, Response } from "express";
import { isGovUKEmailAddress } from "server/utils/validation";
import { createAuthenticationPath } from "server/services/auth";
// import { sendAuthenticationEmail } from "server/services/govuk-notify";
import { logger } from "server/services/logger";

export function getLoginController(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { incorrectToken, token } = req.query;

  if (token !== undefined) {
    return next();
  }

  res.render("login", {
    incorrectToken: incorrectToken === "true",
  });
}

export function postLoginController(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { emailAddress } = req.body;

  if (isGovUKEmailAddress(emailAddress)) {
    const authPath = createAuthenticationPath({ emailAddress });
    const authLink = `${req.protocol}://${req.get("host")}${authPath}`;

    logger.warn(authLink);
    res.render("login", {
      success: true,
    });

    // sendAuthenticationEmail(emailAddress, authLink)
    //   .then(() => {
    //     res.render("login", {
    //       success: true,
    //     });
    //   })
    //   .catch(next);
  } else {
    res.render("login", {
      error: true,
    });
  }
}

export function getLogoutController(req: Request, res: Response): void {
  req.logOut();
  req.session.destroy(() => {
    res.redirect("/");
  });
}
