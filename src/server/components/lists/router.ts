/* eslint-disable @typescript-eslint/no-misused-promises */
import express from "express";
import {
  listsGetController,
  listsPostController,
  listsResultsController,
  listsGetPrivateBetaPage,
  listsDataIngestionController,
  listsConfirmApplicationController,
} from "./lists";

export const listsRoutes = {
  start: "/",
  finder: "/find",
  results: "/results",
  feedback: "/feedback",
  feedbackSuccess: "/feedback/success",
  privateBeta: "/private-beta",
  formRunnerWebhook: "/ingest/:serviceType",
  confirmApplication: "/confirm/:reference",
};

export const listsRouter = express.Router();

listsRouter.get(listsRoutes.finder, listsGetController);
listsRouter.post(listsRoutes.finder, listsPostController);
listsRouter.get(listsRoutes.results, listsResultsController);
listsRouter.post(listsRoutes.formRunnerWebhook, listsDataIngestionController);
listsRouter.get(listsRoutes.confirmApplication, listsConfirmApplicationController);
listsRouter.get(listsRoutes.privateBeta, listsGetPrivateBetaPage);
