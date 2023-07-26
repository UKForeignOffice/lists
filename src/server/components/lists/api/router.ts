import express from "express";
import cors from "cors";
import { listsApiPostController } from "./controllers";

const apiRouter = express.Router();

apiRouter.post("/api/lists", cors(), listsApiPostController);

export default apiRouter;
