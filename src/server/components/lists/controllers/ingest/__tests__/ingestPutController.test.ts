import { ingestPutController } from "../ingestPutController";
import * as listItem from "server/models/listItem/listItem";

const response = {
  statusCode: 0,
  status(code: number) {
    this.statusCode = code;
    return this;
  },
  send(_error: any) {
    return this;
  },
  json(_error: any) {
    return this;
  },
  end() {},
};
test("responds with 400 for schema validation error", async () => {
  const spiedStatus = jest.spyOn(response, "status");
  const spiedSend = jest.spyOn(response, "send");
  jest.spyOn(listItem, "update").mockResolvedValue();

  const schemaErrorReq = {
    params: { id: 1 },
  };
  // @ts-expect-error
  await ingestPutController(schemaErrorReq, response);
  const schemaError = spiedSend.mock.calls[0][0];

  expect(spiedStatus).toBeCalledWith(400);
  expect(schemaError.name).toBe("ValidationError");
  expect(schemaError.isJoi).toBe(true);
});

test("responds with 422 for update error", async () => {
  const spiedStatus = jest.spyOn(response, "status");

  jest.spyOn(listItem, "update").mockRejectedValue("boo");

  const schemaErrorReq = { params: { id: 1 }, body: { questions: [] } };
  // @ts-expect-error
  await ingestPutController(schemaErrorReq, response);

  expect(spiedStatus).toBeCalledWith(422);
});

test("responds with 204 when update is successful", async () => {
  const req = {
    params: {
      id: 1,
      serviceType: "lawyers",
    },
    body: { questions: [] },
  };
  jest.spyOn(listItem, "update").mockResolvedValue();
  const spiedRes = jest.spyOn(response, "status");
  // @ts-expect-error
  await ingestPutController(req, response);
  expect(spiedRes).toBeCalledWith(204);
});

test.todo("failed update is inserted into queue");
