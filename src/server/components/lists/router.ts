/* eslint-disable @typescript-eslint/no-misused-promises */
import express from "express";
import {
  listsGetController,
  listsPostController,
  listsResultsController,
  listsGetPrivateBetaPage,
  listsDataIngestionController,
  listsConfirmApplicationController,
} from "./controllers";
import { listsRoutes } from "./routes";
import { csrfRequestHandler } from "server/components/cookies/helpers";

export const listsRouter = express.Router();

listsRouter.get(listsRoutes.finder, csrfRequestHandler, listsGetController);
listsRouter.post(listsRoutes.finder, csrfRequestHandler, listsPostController);
listsRouter.get(
  listsRoutes.results,
  csrfRequestHandler,
  listsResultsController
);
listsRouter.post(listsRoutes.formRunnerWebhook, listsDataIngestionController);
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
