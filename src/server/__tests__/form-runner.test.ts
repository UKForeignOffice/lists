import request from "supertest";
import { server } from "../server";
import {
  startFormRunner,
  isFormRunnerReady,
} from "server/middlewares/form-runner";

describe.only("Form Runner:", () => {
  beforeAll(async () => {
    await startFormRunner();
  }, 30000);

  test("form-runner is running", async () => {
    expect(await isFormRunnerReady()).toBe(true);
  });

  test("form-runner /health-check is responding correctly", async () => {
    try {
      const response = await request(server)
        .get("/application/health-check")
        .type("text/html");
      expect(response.status).toBe(200);
    } catch (error) {
      // eslint-disable-next-line
      console.log("EEOROR", error);
      expect(false).toBe(true);
    }
  });
});
