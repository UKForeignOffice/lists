import type { Express } from "express";
import express from "express";
import {
  configureAccessControl,
  configureBodyParser,
  configureCompression,
  configureCookieParser,
  configureErrorHandlers,
  configureHelmet,
  configureLogger,
  configureStaticServer,
  configureViews,
} from "./middlewares";
import { initAuth } from "./components/auth";
import { initLists } from "./components/lists";
import { initCookies } from "./components/cookies";
import { initSitemap } from "./components/sitemap";
import { initFeedback } from "./components/feedback";
import { initDashboard } from "./components/dashboard";
import { initDevelopment } from "./components/development";
import { initHealthCheck } from "./components/healthCheck";
import { configureFormRunnerProxyMiddleware } from "./components/proxyMiddleware";

import { isLocalHost, isSmokeTest, NODE_ENV, SERVICE_DOMAIN } from "server/config";
import { logger } from "server/services/logger";

const server = express();

export async function getServer(): Promise<Express> {
  // middlewares
  configureAccessControl(server);
  configureHelmet(server);
  configureLogger(server);
  configureCompression(server);
  configureStaticServer(server);
  configureFormRunnerProxyMiddleware(server);
  configureCookieParser(server);

  configureBodyParser(server);
  configureViews(server);

  // initialize components
  await initAuth(server);
  await initLists(server);
  await initCookies(server);
  await initSitemap(server);
  await initFeedback(server);
  await initDashboard(server);
  await initDevelopment(server);
  await initHealthCheck(server);

  // error handlers
  configureErrorHandlers(server);

  logger.info(
    `NODE_ENV=${NODE_ENV}, LOCAL_HOST=${isLocalHost}, SERVICE_DOMAIN=${SERVICE_DOMAIN}, CI_SMOKE_TEST=${isSmokeTest}`
  );
  return server;
}
