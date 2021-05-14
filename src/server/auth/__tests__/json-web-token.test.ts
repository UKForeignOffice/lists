import jwt from "jsonwebtoken";
import { createAuthenticationPath } from "../json-web-token";
import { JWT_ISSUER } from "../constants";

describe("Auth JSON Web Token", () => {
  describe("createAuthenticationPath", () => {
    test("authentication path is correct", () => {
      const path: any = createAuthenticationPath({
        emailAddress: "test@gov.uk",
      });
      const regex = /\/login\?token=.*/;
      expect(regex.test(path)).toBe(true);
    });

    test("authentication token is valid", () => {
      const path: any = createAuthenticationPath({
        emailAddress: "test@gov.uk",
      });

      const token = path.split("=")[1];
      const json = jwt.decode(token);

      expect(json).toMatchObject({
        user: { emailAddress: "test@gov.uk" },
        iss: JWT_ISSUER,
      });
    });
  });
});
