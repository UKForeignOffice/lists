/* eslint-disable @typescript-eslint/no-misused-promises */
import express from "express";
import {
  listsGetController,
  listsPostController,
  listsResultsController,
  listsGetPrivateBetaPage,
  listsConfirmApplicationController,
  removeLanguageGetController
} from "./controllers";
import { listsRoutes } from "./routes";
import { csrfRequestHandler } from "server/components/cookies/helpers";
import { ingestRouter } from "server/components/lists/controllers/ingest/router";
import annualReviewRouter from "server/components/annual-review/router";

export const listsRouter = express.Router();

listsRouter.get(listsRoutes.finder, csrfRequestHandler, listsGetController);
listsRouter.post(listsRoutes.finder, csrfRequestHandler, listsPostController);
listsRouter.get(listsRoutes.removeLanguage, csrfRequestHandler, removeLanguageGetController);
listsRouter.get(
  listsRoutes.results,
  csrfRequestHandler,
  listsResultsController
);

listsRouter.get(
  listsRoutes.confirmApplication,
  listsConfirmApplicationController
);
listsRouter.get(listsRoutes.privateBeta, listsGetPrivateBetaPage);
listsRouter.get(listsRoutes.accessibility, (req, res) => {
  res.render("help/accessibility-statement");
});
listsRouter.get(listsRoutes.termsAndConditions, (req, res) => {
  res.render("help/terms-and-conditions");
});
listsRouter.use(ingestRouter);
listsRouter.use(annualReviewRouter);
