import request from "supertest";
import { server } from "../server";
import { startFormRunner } from "server/middlewares/form-runner";

describe.only("Form Runner:", () => {
  beforeAll(async () => {
    await startFormRunner();
  }, 300000);

  test("form-runner /health-check is responding correctly", async () => {
    const { status } = await request(server).get("/application/health-check");

    expect(status).toBe(200);
  });
});
