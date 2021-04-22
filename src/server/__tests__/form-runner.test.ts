import request from "supertest";
import { server } from "../server";
import { startFormRunner } from "server/middlewares/form-runner";

describe.only("Form Runner:", () => {
  beforeAll(async () => {
    await startFormRunner();
  }, 30000);

  test("form-runner /health-check is responding correctly", async () => {
    try {
      const response = await request(server).get("/application/health-check");
      console.log(response);
      expect(response.status).toBe(200);
    }catch(error) {
      console.log("XXXXX", error)
    }
  });
});
