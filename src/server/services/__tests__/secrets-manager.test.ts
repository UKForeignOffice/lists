import {
  createSecret,
  rotateSecret,
  getSecretValue,
  getAWSSecretsManagerClient,
} from "../secrets-manager/aws";
import {
  SecretsManagerClient,
  CreateSecretCommand,
  GetSecretValueCommand,
  PutSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";
import { subDays } from "date-fns";
import { logger } from "server/services/logger";

jest.mock("@aws-sdk/client-secrets-manager");
jest.mock("../secrets-manager/helpers", () => ({
  generateRandomSecret: jest.fn().mockReturnValue("123SECRET"),
}));

describe("Secrets Manager", () => {
  let mockSend: jest.Mock;

  beforeEach(() => {
    mockSend = jest.fn();
    SecretsManagerClient.prototype.send = mockSend;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getAWSSecretsManagerClient", () => {
    test("returns an instance of SecretsManagerClient", () => {
      const client = getAWSSecretsManagerClient();
      expect(client).toBeInstanceOf(SecretsManagerClient);
    });

    test("reuses the same SecretsManagerClient instance", () => {
      const client1 = getAWSSecretsManagerClient();
      const client2 = getAWSSecretsManagerClient();
      expect(client1).toBe(client2);
    });
  });

  describe("createSecret", () => {
    test("aws sdk createSecret call is correct", async () => {
      const spy = mockSend.mockResolvedValueOnce("OK");

      const secret = await createSecret("TEST_SECRET");

      expect(secret).toBe(true);
      expect(spy).toHaveBeenCalledWith(expect.any(CreateSecretCommand));
    });

    test("returns false when createSecret rejects with an error", async () => {
      mockSend.mockRejectedValueOnce(new Error("createSecret error"));

      const result = await createSecret("TEST_SECRET");

      expect(result).toBe(false);
      expect(logger.error).toHaveBeenCalledWith(
        "createSecret Error: createSecret error"
      );
    });
  });

  describe("rotateSecret", () => {
    const mockSecret = {
      ARN: "123ARN",
      CreatedDate: subDays(new Date(), 31), // Secret is 31 days old
    };

    test("rotates the secret if older than 30 days", async () => {
      mockSend
        .mockResolvedValueOnce(mockSecret) // Mock getSecretValue response
        .mockResolvedValueOnce({}); // Mock putSecretValue response

      const result = await rotateSecret("TEST_SECRET");

      expect(result).toBe(true);
      expect(mockSend).toHaveBeenCalledWith(expect.any(PutSecretValueCommand));
      expect(logger.info).toHaveBeenCalledWith(
        "Rotate secret TEST_SECRET successfully"
      );
    });

    test("does not rotate the secret if less than 30 days old", async () => {
      const recentSecret = {
        ARN: "123ARN",
        CreatedDate: subDays(new Date(), 29), // Secret is 29 days old
      };

      mockSend.mockResolvedValueOnce(recentSecret);

      const result = await rotateSecret("TEST_SECRET");

      expect(result).toBe(false);
      expect(mockSend).not.toHaveBeenCalledWith(
        expect.any(PutSecretValueCommand)
      );
    });

    test("handles missing ARN or CreatedDate in getSecretValue response", async () => {
      const incompleteSecret = {
        ARN: undefined,
        CreatedDate: undefined,
      };

      mockSend.mockResolvedValueOnce(incompleteSecret);

      const result = await rotateSecret("TEST_SECRET");

      expect(result).toBe(false);
      expect(logger.error).toHaveBeenCalledWith(
        "rotateSecret: Failed to rotate secret TEST_SECRET. Error: Could not getSecret values for secret TEST_SECRET"
      );
    });

    test("returns false when putSecretValue rejects with an error", async () => {
      mockSend
        .mockResolvedValueOnce(mockSecret) // Mock getSecretValue response
        .mockRejectedValueOnce(new Error("putSecretValue error"));

      const result = await rotateSecret("TEST_SECRET");

      expect(result).toBe(false);
      expect(logger.error).toHaveBeenCalledWith(
        "rotateSecret: Failed to rotate secret TEST_SECRET. Error: putSecretValue error"
      );
    });
  });

  describe("getSecretValue", () => {
    test("returns the secret value when it exists", async () => {
      mockSend.mockResolvedValueOnce({ SecretString: "123ABC" });

      const secret = await getSecretValue("TEST_SECRET");

      expect(secret).toEqual("123ABC");
      expect(mockSend).toHaveBeenCalledWith(expect.any(GetSecretValueCommand));
    });

    test("creates secret when secret does not exist", async () => {
      // Simulate AWS ResourceNotFoundException
      const resourceNotFoundException = new Error("ResourceNotFoundException");
      resourceNotFoundException.name = "ResourceNotFoundException";

      // Mock the sequence of calls
      mockSend
        .mockRejectedValueOnce(resourceNotFoundException) // First GetSecretValueCommand fails
        .mockResolvedValueOnce("OK") // CreateSecretCommand succeeds
        .mockResolvedValueOnce({ SecretString: "123ABC" }); // Second GetSecretValueCommand succeeds

      const secret = await getSecretValue("TEST_SECRET");

      // Validate that the final secret value is correct
      expect(secret).toBe("123ABC");

      // Ensure that the mocks were called the correct number of times
      expect(mockSend).toHaveBeenCalledTimes(3); // 2 GetSecretValueCommand + 1 CreateSecretCommand

      // Verify that CreateSecretCommand was used in the call sequence
      expect(mockSend).toHaveBeenCalledWith(expect.any(CreateSecretCommand));
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
