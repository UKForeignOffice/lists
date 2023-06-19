/* eslint-disable @typescript-eslint/no-misused-promises */
import express from "express";
import * as Controllers from "./controllers";
import { listsRoutes } from "./routes";
import { csrfRequestHandler } from "server/components/cookies/helpers";
import { ingestRouter } from "server/components/lists/controllers/ingest/router";
import * as ContactUsController from "server/components/lists/controllers/contactUsController";
import annualReviewRouter from "server/components/annual-review/router";

export const listsRouter = express.Router();

listsRouter.get(listsRoutes.finder, csrfRequestHandler, Controllers.listsGetController);
listsRouter.post(listsRoutes.finder, csrfRequestHandler, Controllers.listsPostController);
listsRouter.get(listsRoutes.removeLanguage, csrfRequestHandler, Controllers.removeLanguageGetController);
listsRouter.get(listsRoutes.results, csrfRequestHandler, Controllers.listsResultsController);
listsRouter.get(listsRoutes.contactUs, csrfRequestHandler, ContactUsController.getContactUsPage);
listsRouter.post(listsRoutes.contactUs, csrfRequestHandler, ContactUsController.postContactUsPage);

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
