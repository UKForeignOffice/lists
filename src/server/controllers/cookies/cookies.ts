import { Buffer } from 'buffer';
import { Request, Response } from "express";
import { COOKIES_PAGE_VIEW, ONE_YEAR } from "./constants";
import { isLocalHost } from "server/config";

export function cookiesGETController(req: Request, res: Response): void {
  res.render(COOKIES_PAGE_VIEW);
}

export function cookiesPOSTController(req: Request, res: Response): void {
  const cookiesPolicy: {
    analytics: "on" | "off";
    isSet: boolean;
    essential: boolean;
    usage: boolean;
  } = {
    isSet: true,
    essential: true,
    analytics: req.body.analytics ?? "off",
    usage: req.body.analytics === "on",
  };

  res.cookie(
    "cookies_policy",
    Buffer.from(JSON.stringify(cookiesPolicy)).toString("base64"),
    {
      maxAge: ONE_YEAR,
      secure: !isLocalHost,
      // disable encode as it breaks form-runner
      encode: v => v,
      // allow cookie to be accessed by JS due to form-runner requirement
      httpOnly: false,
    }
  );

  res.render(COOKIES_PAGE_VIEW, {
    cookiesSettingsSaved: true,
    cookiesPolicy,
  });
}
