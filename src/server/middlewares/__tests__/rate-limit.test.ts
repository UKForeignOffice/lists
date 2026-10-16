import type { Express } from "express";
import request from "supertest";

const originalEnvironment = {
  NODE_ENV: process.env.NODE_ENV,
  RATE_LIMITING_ENABLED: process.env.RATE_LIMITING_ENABLED,
  RATE_LIMIT_MAX: process.env.RATE_LIMIT_MAX,
};

function restoreEnvironmentVariable(name: string, value: string | undefined): void {
  if (value === undefined) {
    delete process.env[name];
  } else {
    process.env[name] = value;
  }
}

function createApp(enabled: boolean, max: number): Express {
  process.env.NODE_ENV = "production";
  process.env.RATE_LIMITING_ENABLED = String(enabled);
  process.env.RATE_LIMIT_MAX = String(max);

  jest.resetModules();

  const express = require("express") as typeof import("express");
  const app = express();
  const { configureRateLimit } = require("../rate-limit") as typeof import("../rate-limit");
  const { configureErrorHandlers } = require("../error-handlers") as typeof import("../error-handlers");

  app.set("trust proxy", ["loopback", "linklocal", "uniquelocal"]);
  configureRateLimit(app);
  app.get("/probe", (req, res) => res.json({ ip: req.ip }));
  configureErrorHandlers(app);

  return app;
}

afterEach(() => {
  restoreEnvironmentVariable("NODE_ENV", originalEnvironment.NODE_ENV);
  restoreEnvironmentVariable("RATE_LIMITING_ENABLED", originalEnvironment.RATE_LIMITING_ENABLED);
  restoreEnvironmentVariable("RATE_LIMIT_MAX", originalEnvironment.RATE_LIMIT_MAX);
  jest.resetModules();
});

describe("Rate limit middleware", () => {
  test("allows requests up to the configured limit and uses the application 429 response", async () => {
    const app = createApp(true, 2);

    expect((await request(app).get("/probe").set("Accept", "application/json")).status).toBe(200);
    expect((await request(app).get("/probe").set("Accept", "application/json")).status).toBe(200);

    const response = await request(app).get("/probe").set("Accept", "application/json");

    expect(response.status).toBe(429);
    expect(response.body).toEqual({
      error: "This request could not be processed - Maximum rate of page requests exceeded - wait and try again",
    });
  });

  test.each<[string, boolean, number]>([
    ["disabled by the feature flag", false, 1],
    ["configured with a zero request limit", true, 0],
  ])("does not rate-limit when %s", async (_description, enabled, max) => {
    const app = createApp(enabled, max);

    for (let i = 0; i < 3; i += 1) {
      expect((await request(app).get("/probe").set("Accept", "application/json")).status).toBe(200);
    }
  });

  test.each(["-1", "not-a-number"])("rejects an invalid enabled request limit of %s", (max) => {
    process.env.RATE_LIMITING_ENABLED = "true";
    process.env.RATE_LIMIT_MAX = max;
    jest.resetModules();

    expect(() => require("../rate-limit")).toThrow(
      "RATE_LIMIT_MAX must be a non-negative integer when rate limiting is enabled"
    );
  });

  test("uses the trusted proxy client IP for the rate-limit key", async () => {
    const app = createApp(true, 1);

    const firstClient = await request(app)
      .get("/probe")
      .set("Accept", "application/json")
      .set("X-Forwarded-For", "198.51.100.10");
    const secondClient = await request(app)
      .get("/probe")
      .set("Accept", "application/json")
      .set("X-Forwarded-For", "198.51.100.11");
    const repeatedFirstClient = await request(app)
      .get("/probe")
      .set("Accept", "application/json")
      .set("X-Forwarded-For", "198.51.100.10");

    expect(firstClient.body.ip).toBe("198.51.100.10");
    expect(secondClient.body.ip).toBe("198.51.100.11");
    expect(firstClient.status).toBe(200);
    expect(secondClient.status).toBe(200);
    expect(repeatedFirstClient.status).toBe(429);
  });

  test("groups IPv6 clients by the default /56 subnet", async () => {
    const app = createApp(true, 1);

    const firstAddress = await request(app)
      .get("/probe")
      .set("Accept", "application/json")
      .set("X-Forwarded-For", "2001:db8:abcd:1200::1");
    const sameSubnet = await request(app)
      .get("/probe")
      .set("Accept", "application/json")
      .set("X-Forwarded-For", "2001:db8:abcd:12ff::1");
    const differentSubnet = await request(app)
      .get("/probe")
      .set("Accept", "application/json")
      .set("X-Forwarded-For", "2001:db8:abcd:1300::1");

    expect(firstAddress.status).toBe(200);
    expect(sameSubnet.status).toBe(429);
    expect(differentSubnet.status).toBe(200);
  });
});
