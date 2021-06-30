import { Express } from "express";
import request from "supertest";
import { getServer } from "../../server";

describe("Sitemap routes", () => {
  let server: Express;

  beforeAll(async () => {
    server = await getServer();
  }, 30000);

  test("/sitemap is responding correctly", async () => {
    const { status } = await request(server).get("/sitemap");
    expect(status).toEqual(200);
  });
});
