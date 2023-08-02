import express from "express";
import { listsApiPostController } from "./controllers";
import hmacSha512 from "./helpers/hmac";

const apiRouter = express.Router();

apiRouter.post("/api/lists", hmacSha512, listsApiPostController);

export default apiRouter;
