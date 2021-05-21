import express, { Express } from "express";
import {
  configureViews,
  configureHelmet,
  configureLogger,
  configureBodyParser,
  configureCompression,
  configureStaticServer,
  configureErrorHandlers,
  configureExpressSession,
  configureFormRunnerProxy,
  configureCookieParser,
} from "./middlewares";
// import { configureAuth } from "./auth";
import { configureRouter } from "./routes";

const server = express();

export async function getServer(): Promise<Express> {
  configureHelmet(server);
  configureLogger(server);
  configureCompression(server);
  configureFormRunnerProxy(
    // form runner proxy must be initialized before body parser
    server
  );
  configureCookieParser(server);
  configureBodyParser(server);
  await configureExpressSession(server);
  // await configureAuth(server);
  configureViews(server);
  configureRouter(server);
  configureStaticServer(server);
  configureErrorHandlers(server);

  return server;
}
