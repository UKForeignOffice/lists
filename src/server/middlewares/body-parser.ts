import type { Express, RequestHandler } from "express";
import { json, urlencoded } from "body-parser";

export const initializeRequestBody: RequestHandler = (req, _res, next) => {
  // body-parser v2 leaves unparsed requests undefined; v1 initialized them to {}.
  if (req.body === undefined) {
    req.body = {};
  }
  next();
};

export function configureBodyParser(server: Express): void {
  server.use([json(), urlencoded({ extended: true }), initializeRequestBody]);
}
