import request from "supertest";
import { server } from "../../server";

describe("Health-check route", () => {
  test("/health-check is responding correctly", async () => {
    const { body, status } = await request(server).get("/health-check");
    expect(status).toEqual(200);
    expect(body).toEqual({ status: "OK" });
  });

  test("/ping is responding correctly", async () => {
    const { body, status } = await request(server).get("/ping");
    expect(status).toEqual(200);
    expect(body).toEqual({ status: "OK" });
  });
});
