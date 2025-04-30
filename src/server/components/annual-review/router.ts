/* eslint-disable */
import express from "express";
import * as AnnualReviewController from "./controller";
const annualReviewRouter = express.Router();

annualReviewRouter.get("/annual-review/confirm/:listItemRef", AnnualReviewController.confirmGetController);
annualReviewRouter.post("/annual-review/confirm/:listItemRef", AnnualReviewController.confirmPostController);
annualReviewRouter.get("/annual-review/declaration/:listItemRef", AnnualReviewController.declarationGetController);
annualReviewRouter.post("/annual-review/declaration/:listItemRef", AnnualReviewController.declarationPostController);
annualReviewRouter.get("/annual-review/submitted", AnnualReviewController.submittedGetController);
annualReviewRouter.get("/annual-review/error", AnnualReviewController.errorGetController);

export default annualReviewRouter;
