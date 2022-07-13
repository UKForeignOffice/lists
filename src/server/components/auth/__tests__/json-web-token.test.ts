import jwt from "jsonwebtoken";
import * as secretsManager from "server/services/secrets-manager";
import {
  createAuthenticationJWT,
  createAuthenticationPath,
  getJwtSecret,
} from "../json-web-token";

describe("Auth JSON Web Token", () => {
  function spyGetSecretValue(): jest.SpyInstance {
    return jest
      .spyOn(secretsManager, "getSecretValue")
      .mockResolvedValue("SECRET_VALUE");
  }

  function spyRotateSecret(): jest.SpyInstance {
    return jest.spyOn(secretsManager, "rotateSecret").mockResolvedValue(true);
  }

  describe("getJwtSecret", () => {
    test("it calls getSecretValue correctly", async () => {
      spyRotateSecret();
      const spyGetSecret = spyGetSecretValue();

      await getJwtSecret();

      expect(spyGetSecret).toHaveBeenCalledWith("JWT_SECRET");
    });

    test("result is correct", async () => {
      spyRotateSecret();
      spyGetSecretValue();

      const result = await getJwtSecret();

      expect(result).toBe("SECRET_VALUE");
    });
  });

  describe("createAuthenticationJWT", () => {
    beforeEach(() => {
      spyRotateSecret();
      spyGetSecretValue();
    });

    const JWT_OPTIONS: any = { algorithm: "HS256", expiresIn: "5m" };
    const user = { email: "a@a.com" };

    test("json web token is signed correctly", async () => {
      const spyJWT = jest
        .spyOn(jwt, "sign")
        .mockReturnValueOnce("JWT_TOKEN_VALUE" as any);

      const token = await createAuthenticationJWT(user);

      expect(token).toBe("JWT_TOKEN_VALUE");
      expect(spyJWT).toHaveBeenCalledWith(
        { user },
        "SECRET_VALUE",
        JWT_OPTIONS
      );
    });

    test("it rejects when jwt.sign fails", async () => {
      jest.spyOn(jwt, "sign").mockImplementationOnce(() => {
        throw new Error("JWT Error");
      });

      await expect(createAuthenticationJWT(user)).rejects.toEqual(
        new Error("JWT Error")
      );
    });
  });

  describe("createAuthenticationPath", () => {
    beforeEach(() => {
      spyRotateSecret();
      spyGetSecretValue();
    });

    test("authentication path is correct", async () => {
      const path: any = await createAuthenticationPath({
        email: "test@gov.uk",
      });
        const regex = /\/login\/.*/;
      expect(regex.test(path)).toBe(true);
    });

    test("authentication token is valid", async () => {
      const path: any = await createAuthenticationPath({
        email: "test@gov.uk",
      });

      const token = path.split("/login/")[1];
      const json = jwt.decode(token);

      expect(json).toMatchObject({
        user: { email: "test@gov.uk" },
      });
    });

    test("it rejects if jwt.sign fails", async () => {
      jest.spyOn(jwt, "sign").mockImplementationOnce(() => {
        throw new Error("JWT Error");
      });

      await expect(
        createAuthenticationPath({
          email: "test@gov.uk",
        })
      ).rejects.toEqual(new Error("JWT Error"));
    });
  });
});
