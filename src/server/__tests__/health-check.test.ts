import { Express } from "express";
import request from "supertest";
import { getServer } from "../server";

describe("Health-check routes", () => {
  let server: Express;
  let env: NodeJS.ProcessEnv;

  beforeAll(async () => {
    server = await getServer();

    env = {
      ...process.env,
    };
  }, 30000);

  afterEach(() => {
    process.env = env;
  });

  test("/health-check is responding correctly", async () => {
    const { body, status } = await request(server).get("/health-check");

    expect(status).toEqual(200);

    expect(body).toEqual({
      status: "OK",
      time: expect.any(String),
      uptime: expect.any(Number),
      version: "v0.0.0-development",
    });
  });

  test("/health-check should return the version when env var is set", async () => {
    process.env.DOCKER_TAG = "GIT_HASH_VALUE";

    const { body, status } = await request(server).get("/health-check");

    expect(status).toEqual(200);

    expect(body).toEqual({
      status: "OK",
      time: expect.any(String),
      uptime: expect.any(Number),
      version: "GIT_HASH_VALUE",
    });
  });

  test("/ping is responding correctly", async () => {
    const { body, status } = await request(server).get("/ping");
    expect(status).toEqual(200);
    expect(body).toEqual({ status: "OK" });
  });
});
