import { recordListItemEvent } from "../../../shared/audit";
import { prisma } from "../db/__mocks__/prisma-client";
import { AuditEvent } from "@prisma/client";

jest.mock("../db/prisma-client");

describe("Audit Model:", () => {
  const sampleAuditObject: any = {};

  describe("recordListItemEvent", () => {
    test.skip("create command is correct", async () => {
      prisma.audit.create.mockResolvedValue(sampleAuditObject);

      await recordListItemEvent({
          eventName: "new",
          itemId: 123,
          userId: 1,
        },
        AuditEvent.NEW);

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
        eventName: "new",
        itemId: 123,
        userId: 1,
      },
        AuditEvent.NEW);

      expect(result).toBe(sampleAuditObject);
    });
  });
});
