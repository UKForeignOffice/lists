import type { Express } from "express";
import cookieParser from "cookie-parser";

export function configureCookieParser(server: Express): void {
  server.use(cookieParser());
}
