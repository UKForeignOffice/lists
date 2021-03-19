import path from "path";
import { Express } from "express";
import nunjucks from "nunjucks";

const ROOT = process.cwd();

const VIEWS_PATHS = [
  path.join(__dirname, "..", "views"),
  path.join(ROOT, "/node_modules/govuk-frontend/govuk/"),
  path.join(ROOT, "/node_modules/govuk-frontend/govuk/components"),
];

export const configureViews = (server: Express): void => {
  server.engine("html", nunjucks.render);
  server.set("view engine", "html");
  nunjucks.configure(VIEWS_PATHS, {
    autoescape: true,
    express: server,
  });
};
