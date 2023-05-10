import { shouldExportViewName } from "../shouldExportViewName";
import * as model from "scheduler/workers/model";

jest.mock("scheduler/workers/model", () => {
  return {
    prisma: {
      audit: {
        findFirst: jest.fn(),
      },
    },
  };
});

test("When no export can be found, shouldExportViewName returns true", () => {
  model.prisma.audit.findFirst.mockResolvedValueOnce(null);
  shouldExportViewName("viewName");
  expect(shouldExportViewName("viewName")).toBeTruthy();
});

test.each`
  days | expected
  ${1} | ${false}
  ${2} | ${false}
  ${3} | ${false}
  ${4} | ${false}
  ${5} | ${false}
  ${6} | ${false}
  ${7} | ${true}
  ${8} | ${true}
`("Returns correct value when it has been $days since last export", async ({ days, expected }) => {
  const date = new Date();
  date.setDate(date.getUTCDate() - days);
  model.prisma.audit.findFirst.mockResolvedValueOnce({
    createdAt: date,
  });

  expect(await shouldExportViewName("viewName")).toBe(expected);
});
