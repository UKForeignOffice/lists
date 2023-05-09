import AuthenticatedUser from "../authenticated-user";
import { prisma } from "../../../models/db/__mocks__/prisma-client";
jest.mock("./../../../models/db/prisma-client");

let user;
let administrator;

beforeEach(() => {
  user = new AuthenticatedUser({
    id: 7,
    jsonData: { roles: [] },
    email: "test@gov.uk",
  });

  administrator = new AuthenticatedUser({
    id: 71,
    jsonData: { roles: ["Administrator"] },
    email: "test@gov.uk",
  });
});

test("isAdministrator evaluation is correct", () => {
  expect(administrator.isAdministrator).toBeTruthy();
  expect(user.isAdministrator).toBeFalsy();
});

test("getLists query is correct for administrator", async () => {
  await administrator.getLists();

  expect(prisma.listsForDashboard.findMany).toHaveBeenCalledWith({
    orderBy: [
      {
        country: "asc",
      },
      {
        type: "asc",
      },
    ],
  });
});

test("should call prisma.listsForDashboard.findMany with default sortOrder when orderByInput is undefined", async () => {
  await user.getLists();
  expect(prisma.listsForDashboard.findMany).toHaveBeenCalledWith({
    where: {
      jsonData: {
        path: ["users"],
        array_contains: ["test@gov.uk"],
      },
    },
    orderBy: [
      {
        country: "asc",
      },
      {
        type: "asc",
      },
    ],
  });
});

test("should call prisma.listsForDashboard.findMany with custom sortOrder when orderByInput is defined", async () => {
  await user.getLists({ administrators: "asc" });
  expect(prisma.listsForDashboard.findMany).toHaveBeenCalledWith({
    where: {
      jsonData: {
        path: ["users"],
        array_contains: ["test@gov.uk"],
      },
    },
    orderBy: [
      {
        admins: "asc",
      }
    ],
  });
});

test("hasAccessToList always returns true when super admin", async () => {
  expect(await administrator.hasAccessToList(1)).toBeTruthy();
  expect(prisma.list).not.toHaveBeenCalled();
});

test("only superAdmins can create new lists", async () => {
  expect(await administrator.hasAccessToList("new")).toBeTruthy();
  expect(prisma.list).not.toHaveBeenCalled();

  expect(await user.hasAccessToList("new")).toBe(false);
  expect(prisma.list).not.toHaveBeenCalled();
});

test("hasAccessToList returns correct value", async () => {
  prisma.list.findFirst.mockResolvedValue(null);
  expect(await user.hasAccessToList(1)).toBe(false);

  prisma.list.findFirst.mockResolvedValue({ id: 1 });
  expect(await user.hasAccessToList(1)).toBe(true);
});
