import path from "path";
import { Express } from "express";
import nunjucks from "nunjucks";

const VIEWS_PATH = path.join(__dirname, "..", "views");

export const configureViews = (server: Express): void => {
  nunjucks.configure(VIEWS_PATH, {
    autoescape: true,
    express: server,
  });
};
