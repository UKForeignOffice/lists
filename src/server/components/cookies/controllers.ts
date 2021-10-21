import { Buffer } from "buffer";
import { Request, Response } from "express";
import Url from "url-parse";
import { COOKIES_PAGE_VIEW, ONE_YEAR } from "./constants";
import { cookiesPageRoute } from "./routes";
import { isLocalHost } from "server/config";

export function cookiesGETController(req: Request, res: Response): void {
  res.render(COOKIES_PAGE_VIEW);
}

export function cookiesPOSTController(req: Request, res: Response): void {
  const { cookies, referrer } = req.body;
  const { href, origin } = new Url(referrer);
  const redirect = href.replace(origin, ""); // Ensure you only redirect to a local path
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
      httpOnly: true,
    }
  );

  if (redirect === cookiesPageRoute) {
    // If the referrer is the cookie page then load back the page.
    res.render(COOKIES_PAGE_VIEW, {
      cookiesSettingsSaved: true,
      cookiesPolicy,
    });
  } else {
    // Otherwise go back to where you got here from.
    res.redirect(redirect);
  }
}
