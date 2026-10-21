import { PrismaPg } from "@prisma/adapter-pg";
import { createPrismaAdapter } from "../prismaAdapter";

jest.mock("@prisma/adapter-pg");

const originalDatabaseUrl = process.env.DATABASE_URL;

afterEach(() => {
  process.env.DATABASE_URL = originalDatabaseUrl;
});

test("rejects a missing PostgreSQL connection string", () => {
  delete process.env.DATABASE_URL;

  expect(() => createPrismaAdapter()).toThrow("DATABASE_URL is required to connect to PostgreSQL");
  expect(PrismaPg).not.toHaveBeenCalled();
});

test("configures the PostgreSQL adapter with the database URL and a connection timeout", () => {
  process.env.DATABASE_URL = "postgresql://localhost/lists";

  createPrismaAdapter();

  expect(PrismaPg).toHaveBeenCalledWith({
    connectionString: "postgresql://localhost/lists",
    connectionTimeoutMillis: 5000,
  });
});
