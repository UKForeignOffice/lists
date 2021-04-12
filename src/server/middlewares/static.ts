import path from "path";
import express, { Express } from "express";

const ROOT = process.cwd();
const NODE_MODULES = path.join(ROOT, "node_modules");
const GOVUK_FRONTEND = path.join(NODE_MODULES, "govuk-frontend", "govuk");

console.log("XXXX", GOVUK_FRONTEND);

const publicFolderPath = path.join(__dirname, "client");
const govUKAssetsFolderPath = path.join(GOVUK_FRONTEND, "assets");
const govUKAllJSPath = path.join(GOVUK_FRONTEND, "all.js");
const accessibleAutoCompletePath = path.join(
  NODE_MODULES,
  "accessible-autocomplete",
  "dist"
);
const errorLogFile = path.join(ROOT, "error.log");

export const configureStaticServer = (server: Express): void => {
  server.use("/assets", express.static(publicFolderPath));
  server.use("/assets", express.static(govUKAssetsFolderPath));
  server.use("/assets/govuk-frontend/all.js", express.static(govUKAllJSPath));
  server.use("/assets", express.static(accessibleAutoCompletePath));
  server.use("/error-log", express.static(errorLogFile));
};
