import { Express } from "express";
import helmet from "helmet";
import { isLocalHost } from "server/config";

export function configureHelmet(server: Express): void {
  server.use(
    helmet({
      referrerPolicy: { policy: "no-referrer" },
      contentSecurityPolicy: !isLocalHost,
    })
  );
}
