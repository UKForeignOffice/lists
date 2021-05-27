import { Express } from "express";
import session from "express-session";
import { isLocalHost } from "server/config";
import { getSecretValue } from "server/services/secrets-manager";

declare module "express-session" {
  export interface SessionData {
    returnTo?: string;
  }
}

export async function configureExpressSession(server: Express): Promise<void> {
  const secret = await getSecretValue("SESSION_SECRET");

  server.use(
    session({
      secret: secret,
      saveUninitialized: true,
      resave: false,
      cookie: { secure: !isLocalHost },
      name: "lists.sid",
    })
  );
}
