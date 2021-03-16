import request from "supertest";
import { server } from "../..";

describe("Compress middleware", () => {
  test("is compressing when Accept-Encoding header is present", async () => {
    const { headers } = await request(server)
      .get("/")
      .set("Accept-Encoding", "gzip");

    expect(headers.vary).toEqual("Accept-Encoding");
  });

  test("is not compressing when x-no-compression header is present", async () => {
    const { headers } = await request(server)
      .get("/")
      .set("x-no-compression", "true")
      .set("Accept-Encoding", "gzip");

    expect(headers.vary).toBeUndefined();
  });
});
