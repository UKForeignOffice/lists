import express from "express";
import {
  configureHelmet,
  configureLogger,
  configureCompression,
  configureViews,
  configureBodyParser,
  configureStaticServer,
  configureErrorHandlers,
  configureFormRunner,
} from "./middlewares";
import { configureRouter } from "./routes";

export const server = express();

// middlewares
configureHelmet(server);
configureLogger(server);
configureCompression(server);
// form runner must be initialized before body parser
configureFormRunner(server);
configureBodyParser(server);
configureViews(server);
configureRouter(server);
configureStaticServer(server);
configureErrorHandlers(server);
