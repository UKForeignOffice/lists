import express from "express";
import { sitemapController } from "server/controllers/sitemap";

const router = express.Router();

router.get("/sitemap", sitemapController);

export default router;
