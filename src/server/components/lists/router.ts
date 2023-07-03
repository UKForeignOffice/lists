/* eslint-disable @typescript-eslint/no-misused-promises */
import express from "express";
import * as Controllers from "./controllers";
import { listsRoutes } from "./routes";
import { csrfRequestHandler } from "server/components/cookies/helpers";
import { ingestRouter } from "server/components/lists/controllers/ingest/router";
import annualReviewRouter from "server/components/annual-review/router";
import { findRouter } from "./find/router";
import { loadQueryParametersIntoSession } from "server/components/lists/find/helpers/loadQueryParametersIntoSession";
import { redirectToFindResource } from "server/components/lists/find/helpers/redirectToFindResource";

export const listsRouter = express.Router();

listsRouter.use("/find", findRouter);
listsRouter.get("/results", loadQueryParametersIntoSession, redirectToFindResource);
listsRouter.get(listsRoutes.removeLanguage, csrfRequestHandler, Controllers.removeLanguageGetController);

listsRouter.get(listsRoutes.confirmApplication, Controllers.listsConfirmApplicationController);
listsRouter.get(listsRoutes.privateBeta, Controllers.listsGetPrivateBetaPage);
listsRouter.get(listsRoutes.noListExists, Controllers.listsGetNonExistent);
listsRouter.get(listsRoutes.accessibility, (_req, res) => {
  res.render("help/accessibility-statement");
});
listsRouter.get(listsRoutes.termsAndConditions, (_req, res) => {
  res.render("help/terms-and-conditions");
});

listsRouter.use(ingestRouter);
listsRouter.use(annualReviewRouter);
