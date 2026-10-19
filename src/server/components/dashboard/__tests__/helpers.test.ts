import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import type { NewSessionData } from "../../formRunner/types";
import { getInitiateFormRunnerSessionToken } from "../helpers";

describe("getInitiateFormRunnerSessionToken", () => {
  let server: ReturnType<typeof createServer>;
  let serverUrl: string;
  let responseStatus: number;
  let receivedMethod: string | undefined;
  let receivedBody: string;

  const webhookData: NewSessionData = {
    name: "test form",
    questions: undefined,
    options: {
      message: "test",
      callbackUrl: "http://localhost/callback",
      redirectPath: "/complete",
    },
    metadata: {},
  };

  beforeEach(async () => {
    responseStatus = 200;
    receivedMethod = undefined;
    receivedBody = "";
    server = createServer((request, response) => {
      receivedMethod = request.method;
      request.on("data", (chunk: Buffer) => {
        receivedBody += chunk.toString();
      });
      request.on("end", () => {
        response.writeHead(responseStatus, { "content-type": "application/json" });
        response.end(responseStatus === 200 ? JSON.stringify({ token: "session-token" }) : "{}");
      });
    });

    await new Promise<void>((resolve) => {
      server.listen(0, "127.0.0.1", resolve);
    });
    const { port } = server.address() as AddressInfo;
    serverUrl = `http://127.0.0.1:${port}`;
  });

  afterEach(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
  });

  it("posts the session data and returns the token", async () => {
    await expect(getInitiateFormRunnerSessionToken(serverUrl, webhookData)).resolves.toBe("session-token");

    expect(receivedMethod).toBe("POST");
    expect(receivedBody).toBe(JSON.stringify(webhookData));
  });

  it("normalizes an HTTP error from the form runner", async () => {
    responseStatus = 500;

    await expect(getInitiateFormRunnerSessionToken(serverUrl, webhookData)).rejects.toThrow(
      "Unable to initiate form runner session"
    );
  });
});
