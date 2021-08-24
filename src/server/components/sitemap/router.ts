import express from "express";
import { sitemapController } from "./sitemap";

export const sitemapRouter = express.Router();

sitemapRouter.get("/sitemap", sitemapController);
