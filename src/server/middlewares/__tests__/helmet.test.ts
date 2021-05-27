import { Express } from "express";
import request from "supertest";
import { getServer } from "../../server";

describe("Helmet middleware", () => {
  let server: Express;

  beforeAll(async () => {
    server = await getServer();
  }, 30000);

  test("referrer-policy is correct", async () => {
    const { headers } = await request(server).get("/");
    expect(headers["referrer-policy"]).toEqual("no-referrer");
  });
});
