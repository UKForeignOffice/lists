import request from "supertest";
import { server } from "../..";

describe("Helmet middleware", () => {
  test("referrer-policy is correct", async () => {
    const { headers } = await request(server).get("/");
    expect(headers["referrer-policy"]).toEqual("no-referrer");
  });
});
