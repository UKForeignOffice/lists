import type { NextFunction, Request, Response } from "express";
import { addCsrfTokenToLocals, singleRouteCsrf } from "server/middlewares/csrf";
import { countriesList } from "server/services/metadata";
import { validateCountryLower } from "server/models/listItem/providers/helpers";
import express from "express";
import { listExists } from "server/components/proxyMiddleware/helpers";
import { json, urlencoded } from "body-parser";
import cookieParser from "cookie-parser";
import { checkCountryQuestionAnswered } from "./middlewares/checkCountryQuestionAnswered";

/**
 * proxy middleware does not work if bodyParser, cookies and csrf have been applied to the server before the proxies
 * are initialised. By applying these middlewares to individual routes, it does not interfere with the proxy.
 */
const bodyParser = [json(), urlencoded({ extended: true })];
const cookies = cookieParser();
const middleware = [...bodyParser, cookies, singleRouteCsrf, addCsrfTokenToLocals];

export const applyRouter = express.Router();

declare module "express-session" {
  export interface SessionData {
    application: {
      type?: "lawyers" | "funeral-directors" | "translators-interpreters";
      country?: string;
      isInitialisedSession?: boolean;
    };
  }
}

applyRouter.get("/application/lawyers/start", (req: Request, res: Response) => {
  res.render("apply/lawyers/start");
});
applyRouter.get("/application/lawyers/which-list-of-lawyers", middleware, (req: Request, res: Response) => {
  res.render("apply/lawyers/which-list-of-lawyers", { countriesList });
});

applyRouter.post("/application/lawyers/which-list-of-lawyers", middleware, async (req: Request, res: Response) => {
  const { country } = req.body;
  const validatedCountry = validateCountryLower(country);

  if (!validatedCountry) {
    req.flash("error", "You must enter a country name");
    res.redirect("/application/lawyers/which-list-of-lawyers");
    return;
  }

  req.session.application = {
    type: "lawyers",
    country: validatedCountry,
  };

  const list = await listExists(validatedCountry, "lawyers");

  if (!list) {
    res.redirect("/application/lawyers/not-currently-accepting");
    return;
  }

  res.redirect("/application/lawyers/what-size-is-your-company-or-firm");
});

applyRouter.get("/application/lawyers/not-currently-accepting", (req: Request, res: Response) => {
  res.render("apply/not-accepting-currently", {
    backLink: "/application/lawyers/which-list-of-lawyers",
    country: req.session?.application?.country,
  });
});
applyRouter.get("/application/session/*", (req: Request, res: Response, next: NextFunction) => {
  req.session.application = {
    isInitialisedSession: true,
  };
  next();
});

/**
 * checkCountryQuestionAnswer must come last to prevent circular redirect
 * todo: change to /application/:serviceType(lawyers|funeral-directors|translators-interpreters)/ when funeral-directors
 * and translators and interpreters flow is done.
 */
applyRouter.get("/application/:serviceType(lawyers)/*", checkCountryQuestionAnswered);
