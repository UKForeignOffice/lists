import request from "supertest";
import { server } from "../server";
import {
  startFormRunner,
  isFormRunnerReady,
} from "server/services/form-runner";

describe("Form Runner:", () => {
  beforeAll(async () => {
    await startFormRunner();
  }, 30000);

  test("form-runner is running", async () => {
    expect(await isFormRunnerReady()).toBe(true);
  });

  test("form-runner /health-check is responding correctly", async () => {
    const response = await request(server)
      .get("/application/health-check")
      .type("text/html");
    expect(response.status).toBe(200);
  });

  test("lawyers form is responding correctly", async () => {
    const response = await request(server)
      .get(
        "/application/lawyers/register-to-the-find-a-lawyer-abroad-service?visit=Suv0rr6BR2"
      )
      .type("text/html");
    expect(response.status).toBe(200);
  });
});
