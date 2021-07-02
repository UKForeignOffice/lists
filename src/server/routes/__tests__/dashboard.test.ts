import request from "supertest";
import { Express } from "express";
import { getServer } from "../../server";
import { dashboardRoutes } from "server/controllers/dashboard";

let mockIsAuthenticated = false;

jest.mock("server/auth/helpers", () => ({
  ...jest.requireActual("server/auth/helpers"),
  ensureAuthenticated: jest.fn().mockImplementation((req, res, next) => {
    if (mockIsAuthenticated) {
      next();
    } else {
      res.redirect("/login");
    }
  }),
}));

describe("Dashboard routes", () => {
  let server: Express;

  beforeAll(async () => {
    server = await getServer();
  }, 30000);

  describe("All dashboard routes", () => {
    test("require authentication", async () => {
      for (const route of Object.entries(dashboardRoutes)) {
        const { headers, status } = await request(server).get(route[1]);

        expect(status).toBe(302);
        expect(headers.location).toBe("/login");
      }
    });
  });

  describe("Users routes", () => {
    beforeAll(() => {
      mockIsAuthenticated = true;
    });

    afterAll(() => {
      mockIsAuthenticated = false;
    });

    test("usersList requires a SuperAdmin user", async () => {
      mockIsAuthenticated = true;

      const { text, status } = await request(server).get(
        dashboardRoutes.usersList
      );

      expect(status).toBe(405);
      expect(text).toBe("Not allowed");
    });

    test("usersEdit requires a SuperAdmin user", async () => {
      mockIsAuthenticated = true;

      const { text, status } = await request(server).get(
        dashboardRoutes.usersList
      );

      expect(status).toBe(405);
      expect(text).toBe("Not allowed");
    });
  });
});
