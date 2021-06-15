import { Express, RequestHandler } from "express";
import helmet from "helmet";

export function configureHelmet(server: Express): void {
  server.use(
    helmet({
      referrerPolicy: { policy: "no-referrer" },
      // contentSecurityPolicy: false, // TODO: When true this breaks some scripts e.b autocomplete input
    }) as RequestHandler
  );
}
