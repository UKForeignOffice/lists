import request from "supertest";
import { server } from "../..";

describe("Home route", () => {
  test("/ is responding correctly", async () => {
    const { status } = await request(server).get("/");
    expect(status).toEqual(200);
  });
});
