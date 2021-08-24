import express from "express";
import { sitemapController } from "server/components/sitemap";

export const sitemapRouter = express.Router();

sitemapRouter.get("/sitemap", sitemapController);
