import { Express } from "express";
import request from "supertest";
import { getServer } from "../server";

describe("Feedback routes", () => {
  let server: Express;

  beforeAll(async () => {
    server = await getServer();
  }, 30000);

  test("/feedback is responding correctly", async () => {
    const { status, body } = await request(server).post("/feedback");

    expect(status).toEqual(400);
    expect(body).toEqual({ error: '"questions" is required' });
  });
});
