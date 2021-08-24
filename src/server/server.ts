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
import { configureAuth } from "./components/auth";
import { configureRouter } from "./routes";
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
  await configureAuth(server);
  configureRouter(server);
  configureErrorHandlers(server);

  return server;
}
