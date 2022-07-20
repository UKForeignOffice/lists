import { Express } from "express";
import request from "supertest";

// TODO: Tests stopped running on CI and results are inconsistent locally. Look at better ways to test this.
describe.skip("Form Runner:", () => {
  let server: Express;

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
