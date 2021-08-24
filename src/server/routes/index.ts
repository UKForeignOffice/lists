import { Express } from "express";
import { listsRouter } from "server/components/lists";
import { cookiesRouter } from "server/components/cookies";
import { sitemapRouter } from "server/components/sitemap";
import { feedbackRouter } from "server/components/feedback";
import { dashboardRouter } from "server/components/dashboard";
import { developmentRouter } from "server/components/development";
import { healthCheckRouter } from "server/components/healthCheck";

export const configureRouter = (server: Express): void => {
  server.use(listsRouter);
  server.use(cookiesRouter);
  server.use(sitemapRouter);
  server.use(feedbackRouter);
  server.use(dashboardRouter);
  server.use(developmentRouter);
  server.use(healthCheckRouter);
};
