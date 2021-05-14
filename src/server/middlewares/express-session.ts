import { Express } from "express";
import session from "express-session";
import { isLocalHost } from "server/config";

declare module "express-session" {
  export interface SessionData {
    returnTo?: string;
  }
}

export function configureExpressSession(server: Express): void {
  server.use(
    session({
      secret: "keyboard cat", // TODO: From environment
      saveUninitialized: true,
      resave: false,
      cookie: { secure: !isLocalHost },
      name: "sid",
    })
  );
}
