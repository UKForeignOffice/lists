import { Express } from "express";
import { getServer } from "../../server";

describe("Views middleware", () => {
  let server: Express;

  beforeAll(async () => {
    server = await getServer();
  }, 30000);

  test("views folder is configured correctly", () => {
    expect(server.settings.views.indexOf("/views")).not.toBe(-1);
  });
});
