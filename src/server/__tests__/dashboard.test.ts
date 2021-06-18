import { Express } from "express";
import request from "supertest";
import { getServer } from "../server";

describe("dashboard Routes", () => {
  let server: Express;

  beforeAll(async () => {
    server = await getServer();
  }, 30000);

  test("routes starting with /dashboard require authentication", async () => {
    const { text, redirect, status } = await request(server)
      .get("/dashboard")
      .type("text/html");

    expect(text.includes("Redirecting")).toBeTruthy();
    expect(status).toBe(302);
    expect(redirect).toBe(true);
  });
});
