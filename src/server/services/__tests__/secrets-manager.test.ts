import crypto from "crypto";
import { createSecret, getSecretValue } from "../secrets-manager";
import { SecretsManager } from "aws-sdk";

describe("Secrets Manager", () => {
  describe("createSecret", () => {
    test("aws sdk createSecret call is correct", async () => {
      jest.spyOn(crypto, "randomBytes").mockImplementation(() => ({
        toString: jest.fn().mockReturnValue("123SECRET"),
      }));

      const secretManager = new SecretsManager();
      const secret = await createSecret("TEST_SECRET");

      expect(secret).toBe(true);
      expect(secretManager.createSecret).toHaveBeenCalledWith({
        Name: "TEST_SECRET",
        SecretString: "123SECRET",
      });
    });
  });

  describe("getSecretValue", () => {
    test("aws sdk getSecretValue call is correct", async () => {
      const secret = await getSecretValue("TEST_SECRET");
      const secretManager = new SecretsManager();

      expect(secret).toEqual("123ABC");
      expect(secretManager.getSecretValue).toHaveBeenCalledWith({
        SecretId: "TEST_SECRET",
      });
    });

    test("it create secret if secret doesn't exist", async () => {
      const secretManager = new SecretsManager();

      jest
        .spyOn(secretManager.getSecretValue(), "promise")
        .mockRejectedValueOnce({ code: "ResourceNotFoundException" });

      const secret = await getSecretValue("TEST_SECRET");

      expect(secret).toBe("123ABC");
      expect(secretManager.createSecret).toHaveBeenCalledWith({
        Name: "TEST_SECRET",
        SecretString: "123SECRET",
      });
    });
  });
});
