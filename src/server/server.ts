import express, { Express } from "express";
import {
  configureAccessControl,
  configureViews,
  configureHelmet,
  configureLogger,
  configureBodyParser,
  configureCompression,
  configureStaticServer,
  configureErrorHandlers,
  configureCookieParser,
  configureRateLimit,
} from "./middlewares";
import { configureFormRunnerProxyMiddleware } from "./components/formRunner";
import { initAuth } from "./components/auth";
import { initLists } from "./components/lists";
import { initCookies } from "./components/cookies";
import { initSitemap } from "./components/sitemap";
import { initFeedback } from "./components/feedback";
import { initDashboard } from "./components/dashboard";
import { initDevelopment } from "./components/development";
import { initHealthCheck } from "./components/healthCheck";

import { isCybDev, isLocalHost, isProd } from "server/config";
import { logger } from "server/services/logger";

const server = express();

export async function getServer(): Promise<Express> {
  if (isProd) {
    server.set("trust proxy", ["loopback", "linklocal", "uniquelocal"]);
  } else {
    server.set("trust proxy", false);
  }

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
  configureRateLimit(server);

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

  logger.info(`Server startup: Environment isLocalHost [${isLocalHost}], isCybDev [${isCybDev}], redirecting to auth link`);

  return server;
}
