import express from "express";
import { sitemapRoute } from "./routes";
import { sitemapController } from "./controllers";

export const sitemapRouter = express.Router();

sitemapRouter.get(sitemapRoute, sitemapController);
