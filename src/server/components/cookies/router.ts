import express from "express";
import { cookiesPageRoute } from "./routes";
import { cookiesGETController, cookiesPOSTController } from "./controllers";

export const cookiesRouter = express.Router();

cookiesRouter.get(cookiesPageRoute, cookiesGETController);
cookiesRouter.post(cookiesPageRoute, cookiesPOSTController);
