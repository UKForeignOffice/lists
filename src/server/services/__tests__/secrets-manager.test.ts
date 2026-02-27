import {
  getSecretValue,
  getAWSSecretsManagerClient,
} from "../secrets-manager/aws";
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";
import { logger } from "server/services/logger";

const mockSend = jest.fn();

jest.mock("@aws-sdk/client-secrets-manager", () => ({
  SecretsManagerClient: jest.fn().mockImplementation(() => ({
    send: mockSend,
  })),
  GetSecretValueCommand: jest.fn(),
}));

jest.mock("../secrets-manager/helpers", () => ({
  generateRandomSecret: jest.fn().mockReturnValue("123SECRET"),
}));

describe("Secrets Manager", () => {
  beforeEach(() => {
    mockSend.mockReset();
    jest.resetModules();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getAWSSecretsManagerClient", () => {
    test("returns an instance with send method", () => {
      const client = getAWSSecretsManagerClient();
      expect(client).toBeDefined();
      expect(client.send).toBeDefined();
    });

    test("reuses the same SecretsManagerClient instance", () => {
      const client1 = getAWSSecretsManagerClient();
      const client2 = getAWSSecretsManagerClient();
      expect(client1).toBe(client2);
    });
  });

  describe("getSecretValue", () => {
    test("returns the secret value when it exists", async () => {
      mockSend.mockResolvedValueOnce({ SecretString: "123ABC" });

      const secret = await getSecretValue("TEST_SECRET");

      expect(secret).toEqual("123ABC");
      expect(mockSend).toHaveBeenCalledWith(expect.any(GetSecretValueCommand));
    });

    test("throws an error for unknown errors", async () => {
      const awsError = new Error("UnknownError");

      mockSend.mockRejectedValueOnce(awsError);

      await expect(getSecretValue("TEST_SECRET")).rejects.toBe(awsError);
      expect(logger.error).toHaveBeenCalledWith(
        "getSecretValue Error: UnknownError"
      );
    });
  });
});
