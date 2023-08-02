import express from "express";
import { listsApiPostController } from "./controllers";
import hmac from "./helpers/hmac";

const apiRouter = express.Router();

apiRouter.post("/api/lists", hmac, listsApiPostController);

export default apiRouter;
