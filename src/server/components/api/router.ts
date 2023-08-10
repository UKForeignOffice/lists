import express from "express";
import { listsApiPostController } from "./listsApiPostController";
import validateSignature from "./middleware/validateSignature";

export const apiRouter = express.Router();

apiRouter.post("/api/lists", validateSignature, listsApiPostController);

export default apiRouter;
