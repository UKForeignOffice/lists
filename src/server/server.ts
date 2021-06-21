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
import { configureAuth } from "./auth";
import { configureRouter } from "./routes";
import { isLocalHost, isTest } from "server/config";

const server = express();

if (!isLocalHost && !isTest) {
  server.set("trust proxy", ["loopback", "linklocal", "uniquelocal"]);
}

export async function getServer(): Promise<Express> {
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
  await configureAuth(server);
  configureRouter(server);
  configureErrorHandlers(server);

  return server;
}
