import { Express, NextFunction, Request, Response } from "express";
import { logger } from "server/services/logger";

export class HttpException extends Error {
  constructor(status: number, message: string) {
    super(message);
    this.name = "HttpException";
    this.status = status;
    this.code = String(status);
    this.message = message;
  }

  status: number;
  code?: string;
}

export const acceptsHTML = (req: Request): boolean => {
  return req.accepts("html") === "html";
};

export const acceptsJSON = (req: Request): boolean => {
  return req.accepts("json") === "json";
};

export const configureErrorHandlers = (server: Express): void => {
  server.use(function (req: Request, res: Response) {
    logger.warn("404 Not found", { path: req.path });

    res.status(404);

    if (acceptsHTML(req)) {
      res.render("errors/404");
    } else if (acceptsJSON(req)) {
      res.json({
        error: "The resource you where looking for is not available.",
      });
    } else {
      res
        .type("txt")
        .send("The resource you where looking for is not available.");
    }
  });

  server.use(function (err: HttpException, req: Request, res: Response) {
    logger.error(`${err.status} Error`, err);
    res.status("status" in err ? err.status : 500);

    if (acceptsHTML(req)) {
      res.render("errors/generic-error", {
        message: err.message ?? "",
        status: err.status
      });
    } else if (acceptsJSON(req)) {
      res.json({
        error: getErrorMessage(err.message),
      });
    } else {
      res.type("txt").send(getErrorMessage(err.message));
    }
  });
};

function getErrorMessage(message: string): string {
  let error = `This request could not be processed`;
  error = `${error}${message ? " - " + message : error}`;
  return error;
}

export function rateLimitExceededErrorHandler (req: Request, res: Response, next: Function): void {
  const err = new HttpException(429, "Maximum rate of page requests exceeded - wait and try again");
  return next(err);
}
