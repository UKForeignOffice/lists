
import { TextEncoder, TextDecoder } from "util";

// @ts-ignore
if (typeof global.TextEncoder === "undefined") {
  // @ts-ignore
  global.TextEncoder = TextEncoder;
}

// @ts-ignore
if (typeof global.TextDecoder === "undefined") {
  // @ts-ignore
  global.TextDecoder = TextDecoder;
}

jest.mock("server/services/logger");
jest.mock("server/services/redis");

jest.mock("crypto", () => {
  const crypto = jest.requireActual("crypto");

  return {
    ...crypto,
    randomBytes: jest.fn((size: number) => Buffer.alloc(size, 1)), // returns predictable buffer of `0x01`
  };
});

beforeEach(() => {
  expect.hasAssertions();
});
