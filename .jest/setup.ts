
import { TextEncoder, TextDecoder } from "util";
import { ReadableStream, TransformStream } from "stream/web";
import { Blob, File } from "buffer";
import { MessageChannel, MessagePort } from "worker_threads";

// Polyfill for cheerio/undici in Jest environment
// @ts-ignore
if (typeof global.ReadableStream === "undefined") {
  // @ts-ignore
  global.ReadableStream = ReadableStream;
}
// @ts-ignore
if (typeof global.TransformStream === "undefined") {
  // @ts-ignore
  global.TransformStream = TransformStream;
}
// @ts-ignore
if (typeof global.Blob === "undefined") {
  // @ts-ignore
  global.Blob = Blob;
}
// @ts-ignore
if (typeof global.MessageChannel === "undefined") {
  // @ts-ignore
  global.MessageChannel = MessageChannel;
}
// @ts-ignore
if (typeof global.MessagePort === "undefined") {
  // @ts-ignore
  global.MessagePort = MessagePort;
}

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
// @ts-ignore
if (typeof global.File === "undefined") {
  // @ts-ignore
  global.File = File;
}
// @ts-ignore
if (typeof global.DOMException === "undefined") {
  // @ts-ignore
  if (typeof DOMException !== "undefined") {
    // @ts-ignore
    global.DOMException = DOMException;
  } else {
    // @ts-ignore
    global.DOMException = class DOMException extends Error {
      constructor(message?: string, name?: string) {
        super(message);
        this.name = name ?? "DOMException";
      }
    };
  }
}

jest.mock("server/services/logger");

jest.mock("server/services/redis");

jest.mock("server/services/secrets-manager", () => ({
  getSecretValue: jest.fn().mockResolvedValue("12345678"),
}));

jest.mock("@aws-sdk/client-location", () => ({
  Location: jest.fn(() => ({
    listPlaceIndexes: jest.fn().mockResolvedValue({ Entries: [] }),
    createPlaceIndex: jest.fn().mockResolvedValue({}),
    searchPlaceIndexForText: jest.fn().mockResolvedValue({ Results: [] }),
  })),
}));

jest.mock("@aws-sdk/client-secrets-manager", () => ({
  SecretsManagerClient: jest.fn().mockImplementation(() => ({
    send: jest.fn().mockResolvedValue({ SecretString: "{}" }),
  })),
  GetSecretValueCommand: jest.fn(),
}));

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
