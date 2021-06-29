import { Express } from "express";
import request from "supertest";
import { getServer } from "../../server";

describe("Cookies routes", () => {
  let server: Express;

  beforeAll(async () => {
    server = await getServer();
  }, 30000);

  test("get /help/cookies is responding correctly", async () => {
    const { text, status } = await request(server)
      .get("/help/cookies")
      .type("text/html");
    expect(status).toEqual(200);
    expect(text.includes(`Cookies on ${process.env.SERVICE_NAME}`)).toBe(true);
  });

  test("post /help/cookies is responding correctly", async () => {
    const { text, status } = await request(server)
      .post("/help/cookies")
      .type("text/html");
    expect(status).toEqual(200);
    expect(text.includes(`Your cookie settings were saved`)).toBe(true);
  });
});
