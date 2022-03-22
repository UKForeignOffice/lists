import * as webhookData from "./webhookData";
jest.mock("server/services/logger");
jest.mock("server/services/redis");

jest.mock("crypto", () => {
  const crypto = jest.requireActual("crypto");

  return {
    ...crypto,
    randomBytes: jest.fn().mockReturnValue("12345678"),
  };
});
global.webhookData = {
  get lawyer() {
    return webhookData.lawyer;
  },
  get covidTestProvider() {
    return webhookData.covidTestProvider;
  },
};

beforeEach(async () => {
  // @ts-ignore
  expect.hasAssertions();
});

afterEach(() => {});

afterAll(() => {
  delete global.webhookData;
});
