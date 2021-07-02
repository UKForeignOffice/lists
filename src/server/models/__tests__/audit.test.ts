import { recordListItemEvent } from "../audit";
import { prisma } from "../db/prisma-client";

describe("Audit Model:", () => {
  const sampleAuditObject = {};

  function spyAuditCreate(
    returnValue: any = sampleAuditObject,
    shouldReject = false
  ): jest.SpyInstance {
    const spy = jest.spyOn(prisma.audit, "create");

    if (shouldReject) {
      spy.mockRejectedValue(returnValue);
    } else {
      spy.mockResolvedValue(returnValue);
    }

    return spy;
  }

  describe("recordListItemEvent", () => {
    test("create command is correct", async () => {
      const spy = spyAuditCreate();

      const result = await recordListItemEvent({
        eventName: "approve",
        itemId: 123,
        userId: 1,
      });

      expect(result).toBe(sampleAuditObject);
      expect(spy).toHaveBeenCalledWith({
        data: {
          type: "listItem",
          jsonData: { eventName: "approve", itemId: 123, userId: 1 },
        },
      });
    });
  });
});
