import { PrismaClient } from "@prisma/client";
import { seedDb } from "../seed-data/seed-db";
import { populateDb } from "../helpers";
import { logger } from "server/services/logger"; 

jest.mock("server/services/logger");
jest.mock("../seed-data/seed-db", () => ({
  seedDb: jest.fn(jest.fn().mockReturnValue("seedDB OK"))
}))

describe("Model DB Helpers", () => {
  describe("populateDb", () => {
    test("it invokes seedDb with prisma client as parameter", async () => {
      const result = await populateDb();
      
      expect(result).toBe("seedDB OK");
      expect(seedDb).toHaveBeenCalledWith(expect.any(PrismaClient));
    });

    test("it throws seedDb error", async () => {
      const error = new Error("seedDb error");
      
      // @ts-expect-error-next-line
      seedDb.mockImplementationOnce(() => { throw error });
      
      await expect(populateDb()).rejects.toThrow(error);
      expect(logger.error).toHaveBeenCalledWith("prepareAndSeedDb Error: seedDb error");
    });
  });
})