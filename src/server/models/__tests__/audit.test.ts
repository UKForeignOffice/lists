import { recordListItemEvent } from "../audit";
import { prisma } from "../db/__mocks__/prisma-client";

jest.mock("../db/prisma-client");

describe("Audit Model:", () => {
  const sampleAuditObject: any = {};

  describe("recordListItemEvent", () => {
    test("create command is correct", async () => {
      prisma.audit.create.mockResolvedValue(sampleAuditObject);

      await recordListItemEvent({
        eventName: "approve",
        itemId: 123,
        userId: 1,
      });

      expect(prisma.audit.create).toHaveBeenCalledWith({
        data: {
          type: "listItem",
          jsonData: { eventName: "approve", itemId: 123, userId: 1 },
        },
      });
    });

    test("create command result is correct", async () => {
      prisma.audit.create.mockResolvedValue(sampleAuditObject);

      const result = await recordListItemEvent({
        eventName: "approve",
        itemId: 123,
        userId: 1,
      });

      expect(result).toBe(sampleAuditObject);
    });
  });
});
