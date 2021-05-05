import express from "express";
import {
  configureHelmet,
  configureLogger,
  configureCompression,
  configureViews,
  configureBodyParser,
  configureStaticServer,
  configureErrorHandlers,
  configureFormRunnerProxy,
} from "./middlewares";
import { configureRouter } from "./routes";

export const server = express();

// middlewares
configureHelmet(server);
configureLogger(server);
configureCompression(server);
// form runner proxy must be initialized before body parser
configureFormRunnerProxy(server);
configureBodyParser(server);
configureViews(server);
configureRouter(server);
configureStaticServer(server);
configureErrorHandlers(server);
