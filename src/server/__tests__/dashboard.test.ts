import { Express } from "express";
import request from "supertest";
import { getServer } from "../server";
import { dashboardRoutes } from "server/components/dashboard";

let mockIsAuthenticated = false;

jest.mock("server/components/auth/helpers", () => ({
  ...jest.requireActual("server/components/auth/helpers"),
  ensureAuthenticated: jest.fn().mockImplementation((req, res, next) => {
    if (mockIsAuthenticated) {
      next();
    } else {
      res.redirect("/login");
    }
  }),
}));


describe("dashboard Routes", () => {
  let server: Express;

  beforeAll(async () => {
    server = await getServer();
  }, 30000);

  test("routes starting with /dashboard require authentication", async () => {
    const { text, redirect, status } = await request(server)
      .get("/dashboard")
      .type("text/html");

    expect(text.includes("Redirecting")).toBeTruthy();
    expect(status).toBe(302);
    expect(redirect).toBe(true);
  });

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
});
