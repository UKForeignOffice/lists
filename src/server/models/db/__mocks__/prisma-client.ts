import { PrismaClient } from "@prisma/client";
import { mockDeep, mockReset, MockProxy } from "jest-mock-extended";
import { prisma as prismaClient } from "../../../../shared/prisma";

jest.mock("../../../../shared/prisma", () => ({
  __esModule: true,
  prisma: mockDeep<PrismaClient>(),
}));

beforeEach(() => {
  mockReset(prisma);
});

export const prisma = prismaClient as unknown as MockProxy<PrismaClient>;
