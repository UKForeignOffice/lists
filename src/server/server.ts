import express, { Express } from "express";
import {
  configureViews,
  configureHelmet,
  configureLogger,
  configureBodyParser,
  configureCompression,
  configureStaticServer,
  configureErrorHandlers,
  configureFormRunnerProxy,
  configureCookieParser,
} from "./middlewares";
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

  configureHelmet(server);
  configureLogger(server);
  configureCompression(server);
  configureStaticServer(server);
  configureFormRunnerProxy(
    // form runner proxy must be initialized before body and cookie parsers
    server
  );
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
  configureErrorHandlers(server);

  return server;
}
