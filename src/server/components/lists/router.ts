/* eslint-disable @typescript-eslint/no-misused-promises */
import express from "express";
import * as Controllers from "./controllers";
import { listsRoutes } from "./routes";
import annualReviewRouter from "server/components/annual-review/router";
import { findRouter } from "./find/router";
import { redirectToFindResource } from "server/components/lists/find/helpers/redirectToFindResource";
import { loadQueryParametersIntoSession } from "server/components/lists/find/middleware/loadQueryParametersIntoSession";
import apiRouter from "./api/router";

export const listsRouter = express.Router();

listsRouter.use("/find", findRouter);
listsRouter.get("/results", loadQueryParametersIntoSession, redirectToFindResource);

listsRouter.get(listsRoutes.confirmApplication, Controllers.listsConfirmApplicationController);
listsRouter.get(listsRoutes.privateBeta, Controllers.listsGetPrivateBetaPage);
listsRouter.get(listsRoutes.noListExists, Controllers.listsGetNonExistent);
listsRouter.get(listsRoutes.accessibility, (_req, res) => {
  res.render("help/accessibility-statement");
});
listsRouter.get(listsRoutes.termsAndConditions, (_req, res) => {
  res.render("help/terms-and-conditions");
});

listsRouter.use(annualReviewRouter);
listsRouter.use(apiRouter);
