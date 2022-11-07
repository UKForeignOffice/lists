import {
  userIsListAdministrator,
  userIsListValidator
} from "../helpers";

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

    test("it return false when user is not a list administrator", () => {
      const user: any = {
        userData: {
          email: "user@test.com",
        },
      };

      const list: any = {
        jsonData: {
          administrators: ["a@a.com"],
        },
      };

      const result = userIsListAdministrator(user, list);
      expect(result).toBe(false);
    });
  });

  describe("userIsListValidator", () => {
    test("it return true when user is a list validator", () => {
      const req: any = {
        user: {
          userData: {
            email: "user@test.com",
          },
        },
      };

      const list: any = {
        jsonData: {
          validators: ["a@a.com", "user@test.com"],
        },
      };

      const result = userIsListValidator(req, list);
      expect(result).toBe(true);
    });

    test("it return false when user is not a list validator", () => {
      const req: any = {
        user: {
          userData: {
            email: "user@test.com",
          },
        },
      };

      const list: any = {
        jsonData: {
          validators: ["a@a.com"],
        },
      };

      const result = userIsListValidator(req, list);
      expect(result).toBe(false);
    });
  });
});
