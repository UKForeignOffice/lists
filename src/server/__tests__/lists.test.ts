import { Express } from "express";
import request from "supertest";
import { getServer } from "../server";

describe("Lists routes", () => {
  let server: Express;

  beforeAll(async () => {
    server = await getServer();
  }, 30000);

  test("lists finder route is ready", async () => {
    const { status } = await request(server).get("/find/lawyers");
    expect(status).toEqual(200);
  });

  test("lists results redirect route is ready", async () => {
    const { status } = await request(server).get(
      "/results?serviceType=lawyers&readNotice=ok&country=Italy&region=Rome&resultsTurnaround=1&readDisclaimer=ok"
    );
    expect(status).toEqual(302);
  });

  test("lists formRunnerWebhook route is ready", async () => {
    const { status } = await request(server).post("/ingest/covidTestProviders");
    expect(status).toEqual(500);
  });
});
