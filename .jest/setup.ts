import * as webhookData from "./webhookData";
import { lawyer } from "./webhookData";
import {
  CovidTestSupplierFormWebhookData,
  LawyersFormWebhookData,
} from "server/components/formRunner";
jest.mock("server/services/logger");
jest.mock("server/services/redis");

jest.mock("crypto", () => {
  const crypto = jest.requireActual("crypto");

  return {
    ...crypto,
    randomBytes: jest.fn().mockReturnValue("12345678"),
  };
});
// @ts-ignore
beforeEach(() => {
  expect.hasAssertions();
});
