import request from "supertest";
import { server } from "../..";

describe("Compress middleware", () => {
  test("is compressing when Accept-Encoding header is present", async () => {
    const { headers } = await request(server)
      .get("/")
      .set("Accept-Encoding", "gzip");

    expect(headers.vary.indexOf("Accept-Encoding") > -1).toBe(true);
  });

  test("is not compressing when x-no-compression header is present", async () => {
    const { headers } = await request(server)
      .get("/")
      .set("x-no-compression", "true")
      .set("Accept-Encoding", "gzip");

    expect(headers.vary.indexOf("Accept-Encoding") > -1).toBe(false);
  });
});
