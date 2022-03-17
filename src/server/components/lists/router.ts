/* eslint-disable @typescript-eslint/no-misused-promises */
import express from "express";
import {
  listsGetController,
  listsPostController,
  listsResultsController,
  listsGetPrivateBetaPage,
  listsConfirmApplicationController,
} from "./controllers";
import { listsRoutes } from "./routes";
import { csrfRequestHandler } from "server/components/cookies/helpers";
import { ingestRouter } from "server/components/lists/controllers/ingest/router";

export const listsRouter = express.Router();

listsRouter.get(listsRoutes.finder, csrfRequestHandler, listsGetController);
listsRouter.post(listsRoutes.finder, csrfRequestHandler, listsPostController);
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
  res.render("accessibility/accessibility-statement");
});
listsRouter.use(ingestRouter);
