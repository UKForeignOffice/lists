import { Express } from "express";
import { json, urlencoded } from "body-parser";

export function configureBodyParser(server: Express): void {
  // @ts-expect-error
  server.use([json(), urlencoded({ extended: true })]);
}
