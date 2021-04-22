import { Express, Request, Response } from "express";
import compression from "compression";

function shouldCompress(req: Request, res: Response): boolean {
  if ("x-no-compression" in req.headers) {
    // don't compress responses with this request header
    return false;
  }

  return compression.filter(req, res);
}

export function configureCompression(server: Express): void {
  server.use(compression({ filter: shouldCompress }));
}
