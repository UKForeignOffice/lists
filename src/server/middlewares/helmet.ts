import { Express } from "express";
import helmet from "helmet";

export function configureHelmet(server: Express): void {
  server.use(
    helmet({
      referrerPolicy: { policy: "no-referrer" },
      // TODO: this is breaking dev process.env.NODE_ENV === "production" ? undefined : false,
      contentSecurityPolicy: false,
    })
  );
}
