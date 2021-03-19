import { Express, Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { logger } from "services/logger";

interface HttpException extends Error {
  status: number;
  message: string;
}

const acceptsHTML = (req: Request): boolean => {
  return req.accepts("html") === "html";
};

const acceptsJSON = (req: Request): boolean => {
  return req.accepts("json") === "json";
};

export const configureErrorHandlers = (server: Express): void => {
  server.use(function (req: Request, res: Response, next: NextFunction) {
    logger.error("404 Not found", { path: req.path });
    
    res.status(404);

    if (acceptsHTML(req)) {
      res.render("errors/404.html");
    } else if (acceptsJSON(req)) {
      res.send({
        error: "The resource you where looking for is not available.",
      });
    } else {
      // default to plain-text. send()
      res
        .type("txt")
        .send("The resource you where looking for is not available.");
    }
  });

  server.use(function (
    err: HttpException,
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    logger.error("500 Error", err);

    res.status("status" in err ? err.status : 500);

    if (acceptsHTML(req)) {
      res.render("errors/500.html");
    } else if (acceptsJSON(req)) {
      res.send({
        error: "Sorry, there is a problem with the service",
      });
    } else {
      res.type("txt").send("Sorry, there is a problem with the service");
    }
  });
};
