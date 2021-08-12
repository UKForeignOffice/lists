import * as pg from "pg";
import { getDbPool } from "../database";

jest.mock("pg", () => ({
  Pool: jest.fn()
}))

describe("Database", () => {
  test("Pool is initialized correctly", async () => {
    const mockPgPool = { pool: 1 };
    // @ts-expect-error
    pg.Pool.mockReturnValueOnce(mockPgPool);
    
    const db = await getDbPool();
    
    expect(db).toBe(mockPgPool);
    expect(pg.Pool).toHaveBeenCalledWith({"connectionString": "postgresql://dumb"});
  });
});
