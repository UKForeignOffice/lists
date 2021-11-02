import { Express } from "express";
import request from "supertest";
import { getServer } from "../server";
import {
  startFormRunner,
  isFormRunnerReady,
} from "server/components/formRunner";

// TODO: Tests stopped running on CI and results are inconsistent locally. Look at better ways to test this.
describe.skip("Form Runner:", () => {
  let server: Express;

  beforeAll(async () => {
    await startFormRunner();
    server = await getServer();
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
        "/application/lawyers/apply-to-be-added-to-the-find-a-lawyer-abroad-service"
      )
      .type("text/html");
    expect(response.status).toBe(200);
  });

  test("covid-test-providers form is responding correctly", async () => {
    const response = await request(server)
      .get(
        "/application/covid-test-providers/register-to-the-find-a-covid-19-test-provider-abroad-service"
      )
      .type("text/html");
    expect(response.status).toBe(200);
  });
});
