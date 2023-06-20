/* eslint-disable @typescript-eslint/no-misused-promises */
import type { NextFunction, Request, Response } from "express";
import express from "express";
import * as Controllers from "./controllers";
import { listsRoutes } from "./routes";
import { csrfRequestHandler } from "server/components/cookies/helpers";
import { ingestRouter } from "server/components/lists/controllers/ingest/router";
import annualReviewRouter from "server/components/annual-review/router";
import { findRouter } from "./find/router";

export const listsRouter = express.Router();

listsRouter.use("/v2/find", findRouter);

listsRouter.use("/find*", (req: Request, res: Response, next: NextFunction) => {
  res.locals.csrfToken = req?.csrfToken?.() ?? "";
  next();
});
listsRouter.get("/find", Controllers.listsGetController);
listsRouter.post("/find", Controllers.listsPostController);
listsRouter.get(listsRoutes.results, Controllers.listsResultsController);
listsRouter.get(listsRoutes.removeLanguage, Controllers.removeLanguageGetController);

listsRouter.get(listsRoutes.confirmApplication, Controllers.listsConfirmApplicationController);
listsRouter.get(listsRoutes.privateBeta, Controllers.listsGetPrivateBetaPage);
listsRouter.get(listsRoutes.noListExists, Controllers.listsGetNonExistent);
listsRouter.get(listsRoutes.accessibility, (req, res) => {
  res.render("help/accessibility-statement");
});
listsRouter.get(listsRoutes.termsAndConditions, (req, res) => {
  res.render("help/terms-and-conditions");
});
listsRouter.use(ingestRouter);
listsRouter.use(annualReviewRouter);
