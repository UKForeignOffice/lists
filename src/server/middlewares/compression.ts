import { Request, Response, RequestHandler } from "express";
import compression from "compression";

function shouldCompress(req: Request, res: Response): boolean {
  if ("x-no-compression" in req.headers) {
    // don't compress responses with this request header
    return false;
  }

  return compression.filter(req, res);
}

export default (): RequestHandler => compression({ filter: shouldCompress });
