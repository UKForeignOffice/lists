import { Express } from "express";
import request from "supertest";
import { getServer } from "../server";

describe("Health-check routes", () => {
  let server: Express;

  beforeAll(async () => {
    server = await getServer();
  }, 30000);

  test("/health-check is responding correctly", async () => {
    const { body, status } = await request(server).get("/health-check");
    expect(status).toEqual(200);
    expect(body).toEqual({ status: "OK" });
  });

  test("/ping is responding correctly", async () => {
    const { body, status } = await request(server).get("/ping");
    expect(status).toEqual(200);
    expect(body).toEqual({ status: "OK" });
  });
});
