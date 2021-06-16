import { Express, RequestHandler } from "express";
import helmet from "helmet";

export function configureHelmet(server: Express): void {
  server.use(
    helmet({
      referrerPolicy: { policy: "no-referrer" },
      contentSecurityPolicy: false,
    }) as RequestHandler
  );
}
