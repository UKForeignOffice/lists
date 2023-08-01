import { Express } from "express";
import request from "supertest";
import { getServer } from "../../server";

describe("Compress middleware", () => {
  let server: Express;

  beforeAll(async () => {
    server = await getServer();
  }, 30000);

  test("is compressing when Accept-Encoding header is present", async () => {
    const { headers } = await request(server).get("/").set("Accept-Encoding", "gzip");

    expect(headers.vary.indexOf("Accept-Encoding") > -1).toBe(true);
  });

  test("is not compressing when x-no-compression header is present", async () => {
    const { headers } = await request(server)
      .get("/find/lawyers")
      .set("x-no-compression", "true")
      .set("Accept-Encoding", "gzip");

    expect(headers.vary).toBe(undefined);
  });
});
