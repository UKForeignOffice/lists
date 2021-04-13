import path from "path";
import nunjucks from "nunjucks";
import { Express } from "express";
import { version } from "../../../package.json";
import { GA_TRACKING_ID, isLocalHost } from "server/config";

const ROOT = process.cwd();

const VIEWS_PATHS = [
  path.join(__dirname, "views"),
  path.join(__dirname, '..', "views"),
  path.join(ROOT, "/node_modules/govuk-frontend/govuk/"),
  path.join(ROOT, "/node_modules/govuk-frontend/govuk/components"),
];

export const configureViews = (server: Express): void => {
  server.engine("html", nunjucks.render);
  server.set("view engine", "html");
  nunjucks
    .configure(VIEWS_PATHS, {
      autoescape: true,
      express: server,
    })
    .addGlobal("appVersion", version)
    .addGlobal("GA_TRACKING_ID", GA_TRACKING_ID)
    .addGlobal("isLocalHOST", isLocalHost);
};
