import { Express } from "express";
import { listsRoutes } from "server/controllers/lists";
import request from "supertest";
import { getServer } from "../../server";

describe("Lists routes", () => {
  let server: Express;

  beforeAll(async () => {
    server = await getServer();
  }, 30000);

  test("lists start route is redirecting correctly", async () => {
    const { status, headers } = await request(server).get(listsRoutes.start);

    expect(status).toEqual(302);
    expect(headers.location).toBe("/find?serviceType=lawyers");
  });

  test("lists finder route is ready", async () => {
    const { status } = await request(server).get(
      "/find?serviceType=covidTestProviders"
    );
    expect(status).toEqual(200);
  });

  test("lists results route is ready", async () => {
    const { status } = await request(server).get(
      "/results?serviceType=covidTestProviders&readNotice=ok&country=Italy&region=Rome&resultsTurnaround=1&readDisclaimer=ok"
    );
    expect(status).toEqual(200);
  });

  test("lists formRunnerWebhook route is ready", async () => {
    const { status } = await request(server).post("/ingest/covidTestProviders");
    expect(status).toEqual(422);
  });

  test("lists private-beta route is ready", async () => {
    const { status } = await request(server).get(
      "/private-beta?serviceType=covidTestProviders"
    );
    expect(status).toEqual(200);
  });
});
