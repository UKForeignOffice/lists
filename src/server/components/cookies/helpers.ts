import { Express } from "express";
import { cookiesRouter } from "./router";

export async function initCookies(server: Express): Promise<void> {
  server.use(cookiesRouter);
}
