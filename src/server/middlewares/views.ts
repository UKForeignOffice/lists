import path from "path";
import { Buffer } from "buffer";
import _, { get, capitalize } from "lodash";
import nunjucks from "nunjucks";
import nunjucksDate from "nunjucks-date";
import { Express } from "express";
import { SERVICE_NAME, SERVICE_DOMAIN, isProd } from "server/config";
import { enforceHttps } from "server/utils/security";
import { parseDate } from "server/utils/date";
import flash from "express-flash";
import { govukRow } from "server/components/dashboard/listsItems/types";

const ROOT = process.cwd();

const VIEWS_PATHS = [
  path.join(__dirname, "views"),
  path.join(__dirname, "..", "views"),
  path.join(ROOT, "/node_modules/govuk-frontend/govuk/"),
  path.join(ROOT, "/node_modules/govuk-frontend/govuk/components"),
];

const EMPTY_BASE64_COOKIE = Buffer.from(JSON.stringify({})).toString("base64");

export const configureViews = (server: Express): void => {
  server.engine("njk", nunjucks.render);
  server.set("view engine", "njk");

  const engine = nunjucks
    .configure(VIEWS_PATHS, {
      autoescape: true,
      express: server,
    })
    .addGlobal("isProd", isProd)
    .addGlobal("SERVICE_NAME", capitalize(SERVICE_NAME))
    .addGlobal("SERVICE_DOMAIN", SERVICE_DOMAIN)
    .addGlobal("enforceHttps", enforceHttps)
    .addGlobal("parseDate", parseDate)
    .addGlobal("_", _);

  // Date filter
  nunjucksDate.setDefaultFormat("DD MMM YYYY");

  engine.addFilter("renderRowValues", function (rows: govukRow[], macroSet) {
    return (rows ?? []).map((row) => {
      const macro = macroSet[row.type!];

      const value = row.value;
      if (value.text !== undefined) {
        value.text = macro(value.text);
      }
      if (value.html) {
        value.html = macro(value.html);
      }

      return {
        ...row,
        value,
      };
    });
  });

  nunjucksDate.install(engine);

  server.use(flash());

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

    // Retrieve current location in templates
    engine.addGlobal("currentLocation", req.originalUrl);

    next();
  });
};
