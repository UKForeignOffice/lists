import { ingestPutController } from "../ingestPutController";

test("responds with 422 for any error", () => {
  expect(ingestPutController().statusCode).toBe(422);
});

test("responds with 204 when update is successful", () => {
  expect(ingestPutController().statusCode).toBe(204);
});
