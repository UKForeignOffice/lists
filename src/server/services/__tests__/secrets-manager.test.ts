import crypto from "crypto";
import { createSecret, rotateSecret, getSecretValue } from "../secrets-manager";
import { SecretsManager } from "aws-sdk";
import { subDays } from "date-fns";

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

      const secretManager = new SecretsManager();
      const secret = await createSecret("TEST_SECRET");

      expect(secret).toBe(true);
      expect(secretManager.createSecret).toHaveBeenCalledWith({
        Name: "TEST_SECRET",
        SecretString: "123SECRET",
      });
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
  });
});
