import * as webhookData from "./webhookData";
import {
  CovidTestSupplierFormWebhookData,
  LawyersFormWebhookData,
} from "../src/server/components/formRunner";

jest.mock("server/services/logger");
jest.mock("server/services/redis");

jest.mock("crypto", () => {
  const crypto = jest.requireActual("crypto");

  return {
    ...crypto,
    randomBytes: jest.fn().mockReturnValue("12345678"),
  };
});

beforeEach(() => {
  expect.hasAssertions();
});

// @ts-ignore
global.webhookData = webhookData;
