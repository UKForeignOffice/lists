import path from "path";
import express, { Express } from "express";

export const configureStaticServer = (server: Express): void => {
  const publicFolderPath = path.join(__dirname, "..", "..", "public");
  const govUKAssetsFolderPath = path.join(process.cwd(), "/node_modules/govuk-frontend/govuk/assets");
  
  server.use("/assets", express.static(publicFolderPath));
  server.use("/assets", express.static(govUKAssetsFolderPath));
};
