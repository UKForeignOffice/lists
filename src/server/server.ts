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

import {isDevMode, isLocalHost, isSmokeTest, NODE_ENV, SERVICE_DOMAIN} from "server/config";
import { logger } from "server/services/logger";
import { ingestRouter } from "server/components/lists/controllers/ingest/router";
import { configureCsrf } from "server/middlewares/csrf";
import { configureExpressSession } from "server/components/auth/express-session";

const server = express();

export async function getServer(): Promise<Express> {
  /**
   * Application level middleware
   */

  configureAccessControl(server);
  configureHelmet(server);
  configureLogger(server);
  configureCompression(server);
  configureStaticServer(server);
  await configureExpressSession(server);
  configureCookieParser(server);
  configureViews(server);

  configureFormRunnerProxyMiddleware(server);
  configureBodyParser(server);

  /**
   * API routes
   * note: put any API routes, or routes which are expecting a request FROM an external service above configureCsrf. Including requests from the form runner.
   *
   */

  server.use(ingestRouter);
  await initFeedback(server);

  configureCsrf(server);

  /**
   * Internal routes
   * note: put all other routes here, so they are protected by csrf middleware.
   */

  await initAuth(server);
  await initLists(server);
  await initCookies(server);
  await initSitemap(server);
  await initDashboard(server);
  await initDevelopment(server);
  await initHealthCheck(server);

  // error handlers
  configureErrorHandlers(server);

  logger.info(
    `NODE_ENV=${NODE_ENV}, DEV_MODE=${isDevMode}, LOCAL_HOST=${isLocalHost}, SERVICE_DOMAIN=${SERVICE_DOMAIN}, CI_SMOKE_TEST=${isSmokeTest}`
  );
  return server;
}
