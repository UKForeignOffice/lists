import express from "express";
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
} from "./middlewares";
import { configureAuth } from "./services/auth";
import { configureRouter } from "./routes";

export const server = express();

// middlewares
configureHelmet(server);
configureLogger(server);
configureCompression(server);
configureFormRunnerProxy(
  // form runner proxy must be initialized before body parser
  server
);
configureBodyParser(server);
configureExpressSession(server);
configureViews(server);
configureAuth(server);
configureRouter(server);
configureStaticServer(server);
configureErrorHandlers(server);
