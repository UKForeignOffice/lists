import express from "express";
import {
  helmet,
  logger,
  bodyParser,
  compression,
  configureViews,
  configureStaticServer,
  configureErrorHandlers,
  configureFormRunner,
} from "./middlewares";
import { configureRouter } from "./routes";

export const server = express();

// middlewares
server.use(helmet());
server.use(logger());
server.use(compression());

// form runner must be initialized before body parser
configureFormRunner(server);

server.use(bodyParser());

// views
configureViews(server);

// routes
configureRouter(server);

// public assets
configureStaticServer(server);

// error handlers
configureErrorHandlers(server);
