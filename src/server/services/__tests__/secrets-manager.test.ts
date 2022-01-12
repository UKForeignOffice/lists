import crypto from "crypto";
import {
  createSecret,
  rotateSecret,
  getSecretValue,
} from "../secrets-manager/aws";
import { SecretsManager } from "aws-sdk";
import { subDays } from "date-fns";
import { logger } from "server/services/logger";

describe("Secrets Manager", () => {
  let secretManager: SecretsManager;

  beforeEach(() => {
    secretManager = new SecretsManager();
  });

  function spyRandomBytes(): jest.SpyInstance {
    return jest.spyOn(crypto, "randomBytes").mockImplementation(() => ({
      toString: jest.fn().mockReturnValue("123SECRET"),
    }));
  }

  function spyGetSecretValue(
    returnedValue: any,
    shouldReject = false
  ): jest.SpyInstance {
    const spy = jest.spyOn(secretManager.getSecretValue(), "promise");

    if (shouldReject) {
      spy.mockRejectedValueOnce(returnedValue);
    } else {
      spy.mockResolvedValueOnce(returnedValue);
    }

    return spy;
  }

  function spyCreateSecret(
    returnedValue: any,
    shouldReject = false
  ): jest.SpyInstance {
    return jest.spyOn(secretManager, "createSecret").mockReturnValue({
      promise: shouldReject
        ? jest.fn().mockRejectedValue(returnedValue)
        : jest.fn().mockResolvedValue(returnedValue),
    } as any);
  }

  function spyPutSecretValue(
    returnedValue: any,
    shouldReject = false
  ): jest.SpyInstance {
    return jest.spyOn(secretManager, "putSecretValue").mockReturnValue({
      promise: shouldReject
        ? jest.fn().mockRejectedValue(returnedValue)
        : jest.fn().mockResolvedValue(returnedValue),
    } as any);
  }

  describe("createSecret", () => {
    test("aws sdk createSecret call is correct", async () => {
      spyRandomBytes();
      const spy = spyCreateSecret("OK");

      const secret = await createSecret("TEST_SECRET");

      expect(secret).toBe(true);
      expect(spy).toHaveBeenCalledWith({
        Name: "TEST_SECRET",
        SecretString: "123SECRET",
      });
    });

    test("it returns undefined when createSecret rejects", async () => {
      spyCreateSecret(new Error("createSecret error message"), true);

      const secret = await createSecret("TEST_SECRET");

      expect(secret).toBe(false);
    });
  });

  describe("rotateSecret", () => {
    const mockSecret = {
      ARN: "123ARN",
      Name: "TEST_SECRET",
      VersionId: "123VERSION",
      SecretString: "123SECRET",
      VersionStages: ["AWSCURRENT"],
    };

    test("aws sdk putSecretValue call is correct", async () => {
      spyRandomBytes();
      spyGetSecretValue({
        ...mockSecret,
        CreatedDate: subDays(new Date(), 30),
      });
      const spy = spyPutSecretValue({});

      const result = await rotateSecret("TEST_SECRET");

      expect(result).toBe(true);
      expect(spy).toHaveBeenCalledWith({
        SecretId: mockSecret.ARN,
        SecretString: "123SECRET",
      });
    });

    test("it won't attempt to rotate secret if secret age is less than 30 days", async () => {
      spyRandomBytes();
      spyGetSecretValue({
        ...mockSecret,
        CreatedDate: subDays(new Date(), 29),
      });
      const spy = spyPutSecretValue({});

      const result = await rotateSecret("TEST_SECRET");

      expect(result).toBe(false);
      expect(spy).not.toHaveBeenCalled();
    });

    test("it throws when getSecretValue resolves without ARN or CreatedDate", async () => {
      spyGetSecretValue({ ARN: undefined, CreatedDate: undefined });

      const result = await rotateSecret("TEST_SECRET");

      expect(result).toBe(false);
      expect(logger.error).toHaveBeenCalledWith(
        "Failed to rotate secret TEST_SECRET. Error: Could not getSecret values for secret TEST_SECRET"
      );
    });
  });

  describe("getSecretValue", () => {
    test("aws sdk getSecretValue call is correct", async () => {
      const secret = await getSecretValue("TEST_SECRET");

      expect(secret).toEqual("123ABC");
      expect(secretManager.getSecretValue).toHaveBeenCalledWith({
        SecretId: "TEST_SECRET",
      });
    });

    test("it create secret if secret doesn't exist", async () => {
      spyGetSecretValue({ code: "ResourceNotFoundException" }, true);

      const secret = await getSecretValue("TEST_SECRET");

      expect(secret).toBe("123ABC");
      expect(secretManager.createSecret).toHaveBeenCalledWith({
        Name: "TEST_SECRET",
        SecretString: "123SECRET",
      });
    });

    test("it throws when getSecretValue in unknown", async () => {
      const awsError = new Error("UnknownError");

      spyGetSecretValue(awsError, true);

      await expect(getSecretValue("TEST_SECRET")).rejects.toBe(awsError);
    });
  });
});
