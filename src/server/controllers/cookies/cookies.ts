import { Request, Response } from "express";
import { COOKIES_PAGE_VIEW, ONE_YEAR } from "./constants";

export function cookiesPageGETController(req: Request, res: Response): void {
  res.render(COOKIES_PAGE_VIEW);
}

export function cookiesPagePOSTController(req: Request, res: Response): void {
  const cookiesPolicy: {
    analytics: "on" | "off";
    isSet: boolean;
    usage: boolean;
  } = {
    isSet: true,
    analytics: req.body.analytics,
    usage: req.body.analytics === "on"
  };

  res.cookie("cookies_policy", JSON.stringify(cookiesPolicy), {
    maxAge: ONE_YEAR,
    httpOnly: true,
    secure: true,
  });

  res.render(COOKIES_PAGE_VIEW, {
    cookiesSettingsSaved: true,
    cookiesPolicy,
  });
}
