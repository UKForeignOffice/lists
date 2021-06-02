import jwt from "jsonwebtoken";
import { createAuthenticationPath } from "../json-web-token";

describe("Auth JSON Web Token", () => {
  describe("createAuthenticationPath", () => {
    test("authentication path is correct", async () => {
      const path: any = await createAuthenticationPath({
        email: "test@gov.uk",
      });
      const regex = /\/login\?token=.*/;
      expect(regex.test(path)).toBe(true);
    });

    test("authentication token is valid", async () => {
      const path: any = await createAuthenticationPath({
        email: "test@gov.uk",
      });

      const token = path.split("=")[1];
      const json = jwt.decode(token);

      expect(json).toMatchObject({
        user: { email: "test@gov.uk" },
      });
    });
  });
});
