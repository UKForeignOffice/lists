import { userIsListAdministrator } from "../helpers";

describe("Dashboard Helpers", () => {
  describe("userIsListAdministrator", () => {
    test("it return true when user is a list administrator", () => {
      const req: any = {
        user: {
          userData: {
            email: "user@test.com",
          },
        },
      };

      const list: any = {
        jsonData: {
          administrators: ["a@a.com", "user@test.com"],
        },
      };

      const result = userIsListAdministrator(req, list);
      expect(result).toBe(true);
    });
  });
});
