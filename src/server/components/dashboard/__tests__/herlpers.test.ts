import {
  filterSuperAdminRole,
  userIsListAdministrator,
  userIsListValidator,
  userIsListPublisher,
} from "../helpers";
import { UserRoles } from "server/models/types";

describe("Dashboard Helpers", () => {
  describe("filterSuperAdminRole", () => {
    test("SuperAdmin role is filtered out", () => {
      const result = filterSuperAdminRole([
        UserRoles.ListsCreator,
        UserRoles.SuperAdmin,
      ]);
      expect(result).toHaveLength(1);
      expect(result.includes(UserRoles.SuperAdmin)).toBe(false);
    });
  });

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

  describe("userIsListPublisher", () => {
    test("it return true when user is a list publisher", () => {
      const req: any = {
        user: {
          userData: {
            email: "user@test.com",
          },
        },
      };

      const list: any = {
        jsonData: {
          publishers: ["a@a.com", "user@test.com"],
        },
      };

      const result = userIsListPublisher(req, list);
      expect(result).toBe(true);
    });

    test("it return false when user is not a list publisher", () => {
      const req: any = {
        user: {
          userData: {
            email: "user@test.com",
          },
        },
      };

      const list: any = {
        jsonData: {
          publishers: ["a@a.com"],
        },
      };

      const result = userIsListPublisher(req, list);
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
