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

  test("x-content-type-options is set (noSniff)", async () => {
    const { headers } = await request(server).get("/");
    expect(headers["x-content-type-options"]).toEqual("nosniff");
  });

  test("x-dns-prefetch-control is set", async () => {
    const { headers } = await request(server).get("/");
    expect(headers["x-dns-prefetch-control"]).toEqual("off");
  });

  test("x-permitted-cross-domain-policies is set", async () => {
    const { headers } = await request(server).get("/");
    expect(headers["x-permitted-cross-domain-policies"]).toEqual("none");
  });

  test("x-powered-by header is removed (hidePoweredBy)", async () => {
    const { headers } = await request(server).get("/");
    expect(headers["x-powered-by"]).toBeUndefined();
  });

  test("content-security-policy is set", async () => {
    const { headers } = await request(server).get("/");
    expect(headers["content-security-policy"]).toBeDefined();
    expect(headers["content-security-policy"]).toContain("default-src");
  });
});
