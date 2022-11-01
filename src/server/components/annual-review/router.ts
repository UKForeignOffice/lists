import express from "express";
import * as AnnualReviewController from "./controller";
// import { csrfRequestHandler } from "server/components/cookies/helpers";


const annualReviewRouter = express.Router();

annualReviewRouter.get("/annual-review/confirm/:listItemRef", AnnualReviewController.confirm);

export default annualReviewRouter;
