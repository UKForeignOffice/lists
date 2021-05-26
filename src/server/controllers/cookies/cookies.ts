import { Request, Response } from "express";
import { COOKIES_PAGE_VIEW, ONE_YEAR } from "./constants";

export function cookiesPageGETController(req: Request, res: Response): void {
  res.render(COOKIES_PAGE_VIEW);
}

export function cookiesPagePOSTController(req: Request, res: Response): void {
  const cookiesPolicy: {
    analytics: "on" | "off";
    isSet: boolean;
  } = {
    isSet: true,
    ...req.body,
  };

  res.cookie("lists.cookies_policy", JSON.stringify(cookiesPolicy), {
    encode: String,
    maxAge: ONE_YEAR,
    httpOnly: true,
  });

  res.render(COOKIES_PAGE_VIEW, {
    cookiesSettingsSaved: true,
    cookiesPolicy,
  });
}
