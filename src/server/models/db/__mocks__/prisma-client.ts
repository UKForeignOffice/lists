import type { PrismaClient } from "@prisma/client";
import type { MockProxy } from "jest-mock-extended";
import { mockDeep, mockReset } from "jest-mock-extended";
import { prisma as prismaClient } from "../prisma-client";

jest.mock("../prisma-client", () => ({
  __esModule: true,
  prisma: mockDeep<PrismaClient>(),
}));

beforeEach(() => {
  mockReset(prisma);
});

export const prisma = prismaClient as unknown as MockProxy<PrismaClient>;
