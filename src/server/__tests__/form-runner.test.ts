import request from "supertest";
import { server } from "../server";
import { startFormRunner } from "server/middlewares/form-runner";

describe.only("Form Runner:", () => {
  beforeAll(async () => {
    await startFormRunner();
  }, 30000);

  test("form-runner /health-check is responding correctly", async () => {
    const response = await request(server)
      .get("/application/health-check")
      .type("text/html");
    expect(response.status).toBe(200);
  });
});
