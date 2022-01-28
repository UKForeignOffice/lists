import { Express, Request, Response } from "express";
import { logger } from "server/services/logger";

export interface HttpException extends Error {
  status: number;
  code?: string;
  message: string;
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
      // default to plain-text. send()
      res
        .type("txt")
        .send("The resource you where looking for is not available.");
    }
  });

  server.use(function (err: HttpException, req: Request, res: Response) {
    logger.error("500 Error", err);

    res.status("status" in err ? err.status : 500);

    if (acceptsHTML(req)) {
      res.render("errors/500");
    } else if (acceptsJSON(req)) {
      res.json({
        error: "Sorry, there is a problem with the service",
      });
    } else {
      res.type("txt").send("Sorry, there is a problem with the service");
    }
  });

  server.use(function (err: HttpException, req: Request, res: Response, next: Function) {
    if (err.code !== 'EBADCSRFTOKEN') return next(err)

    logger.warn("403 Forbidden. Bad CSRF token.", { path: req.path });

    // handle CSRF token errors here
    res.status(403)

    if (acceptsHTML(req)) {
      res.render("errors/403");
    } else if (acceptsJSON(req)) {
      res.json({
        error: "This request could not be processed.  Please try again.",
      });
    } else {
      res.type("txt").send("This request could not be processed.  Please try again.");
    }
  });
};

export function rateLimitExceededErrorHandler (req: Request, res: Response, next: Function): void {
  logger.warn("429 Too many requests", { path: req.path });
  res.status(429);

  if (acceptsHTML(req)) {
    res.render("errors/429");
  } else if (acceptsJSON(req)) {
    res.json({
      error: "You have exceeded the maximum rate of page requests",
    });
  } else {
    res
      .type("txt")
      .send("You have exceeded the maximum rate of page requests");
  }
}
