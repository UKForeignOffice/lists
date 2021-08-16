import path from "path";
import { Buffer } from "buffer";
import _, { get } from "lodash";
import nunjucks from "nunjucks";
import { Express } from "express";
import { version } from "../../../package.json";
import { SERVICE_NAME, SERVICE_DOMAIN, isProd } from "server/config";
import { enforceHttps } from "server/utils/security";

const ROOT = process.cwd();

const VIEWS_PATHS = [
  path.join(__dirname, "views"),
  path.join(__dirname, "..", "views"),
  path.join(ROOT, "/node_modules/govuk-frontend/govuk/"),
  path.join(ROOT, "/node_modules/govuk-frontend/govuk/components"),
];

const EMPTY_BASE64_COOKIE = Buffer.from(JSON.stringify({})).toString("base64");

export const configureViews = (server: Express): void => {
  server.engine("html", nunjucks.render);
  server.set("view engine", "html");

  const engine = nunjucks
    .configure(VIEWS_PATHS, {
      autoescape: true,
      express: server,
    })
    .addGlobal("isProd", isProd)
    .addGlobal("appVersion", version)
    .addGlobal("SERVICE_NAME", SERVICE_NAME)
    .addGlobal("SERVICE_DOMAIN", SERVICE_DOMAIN)
    .addGlobal("enforceHttps", enforceHttps)
    .addGlobal("_", _);

  // dynamic globals
  server.use((req, res, next) => {
    let cookiesPolicy = {};

    try {
      cookiesPolicy = JSON.parse(
        Buffer.from(
          get(req, "cookies.cookies_policy", EMPTY_BASE64_COOKIE),
          "base64"
        ).toString("ascii")
      );
    } catch (error) {
      // cleanup legacy json cookie
      res.clearCookie("cookies_policy");
    }

    engine.addGlobal("cookiesPolicy", cookiesPolicy);

    // cspNonce see Helmet configuration
    engine.addGlobal("cspNonce", res.locals.cspNonce);
    next();
  });
};
