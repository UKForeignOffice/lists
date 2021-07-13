import { PrismaClient } from "@prisma/client";
import { mockDeep, mockReset, MockProxy } from "jest-mock-extended";
import { prisma as prismaClient } from "../prisma-client";

jest.mock("../prisma-client", () => ({
  __esModule: true,
  prisma: mockDeep<PrismaClient>(),
}));

beforeEach(() => {
  mockReset(prisma);
});

export const prisma = prismaClient as unknown as MockProxy<PrismaClient>;
