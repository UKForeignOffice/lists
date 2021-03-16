import express from "express";
import { configureViews, helmet, compression, logger } from "./middlewares";
import { configureRouter } from "./routes";

export const server = express();

// middlewares
server.use(helmet());
server.use(compression());
server.use(logger());

// views
configureViews(server);

// routes
configureRouter(server);
