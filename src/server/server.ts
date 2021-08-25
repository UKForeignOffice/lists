import express, { Express } from "express";
import {
  configureViews,
  configureHelmet,
  configureLogger,
  configureBodyParser,
  configureCompression,
  configureStaticServer,
  configureErrorHandlers,
  configureCookieParser,
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
import { isProd } from "server/config";

const server = express();

export async function getServer(): Promise<Express> {
  if (isProd) {
    server.set("trust proxy", ["loopback", "linklocal", "uniquelocal"]);
  } else {
    server.set("trust proxy", false);
  }

  // middlewares
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

  return server;
}
