import { Buffer } from "buffer";
import { Request, Response } from "express";
import { COOKIES_PAGE_VIEW, ONE_YEAR } from "./constants";
import { cookiesPageRoute } from "./routes";
import { isLocalHost } from "server/config";

export function cookiesGETController(req: Request, res: Response): void {
  res.render(COOKIES_PAGE_VIEW);
}

export function cookiesPOSTController(req: Request, res: Response): void {
  const { cookies, referrer, redirect } = req.body;
  const accept = cookies === "accept";
  const cookiesPolicy = {
    isSet: true,
    essential: true,
    analytics: accept ? "on" : "off",
    usage: accept,
  };

  res.cookie(
    "cookies_policy",
    Buffer.from(JSON.stringify(cookiesPolicy)).toString("base64"),
    {
      maxAge: ONE_YEAR,
      secure: !isLocalHost,
      // disable encode as it breaks form-runner
      encode: (v) => v,
      // allow cookie to be accessed by JS due to form-runner requirement
      httpOnly: false,
    }
  );

  if (referrer === cookiesPageRoute) {
    // If the referrer is the cookie page then load back the page.
    res.render(COOKIES_PAGE_VIEW, {
      cookiesSettingsSaved: true,
      cookiesPolicy,
    });
  } else if (redirect !== "false") {
    // If the payload doesn't include a redirect is false flag (i.e. request is via fetch) then redirect back to the page you were on. This is primarily for users with JS disabled.
    res.redirect(referrer);
  } else {
    // Otherwise return nothing.
    res.end();
  }
}
