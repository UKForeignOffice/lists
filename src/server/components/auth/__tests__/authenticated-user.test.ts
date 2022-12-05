import AuthenticatedUser from "../authenticated-user";
import { prisma } from "../../../models/db/__mocks__/prisma-client";
jest.mock("./../../../models/db/prisma-client");

let user;
let superAdmin;

beforeEach(() => {
  user = new AuthenticatedUser({
    id: 7,
    jsonData: { roles: [] },
    email: "test@gov.uk",
  });

  superAdmin = new AuthenticatedUser({
    id: 71,
    jsonData: { roles: ["SuperAdmin"] },
    email: "test@gov.uk",
  });
});

test("isSuperAdmin evaluation is correct", () => {
  expect(superAdmin.isSuperAdmin()).toBeTruthy();
  expect(user.isSuperAdmin()).toBeFalsy();
});

test("getLists query is correct for superAdmin", async () => {
  await superAdmin.getLists();

  expect(prisma.list.findMany).toHaveBeenCalledWith({
    orderBy: {
      id: "asc",
    },
    include: {
      country: true,
    },
  });
});

test("getLists query is correct for user", async () => {
  await user.getLists();
  expect(prisma.list.findMany).toHaveBeenCalledWith({
    where: {
      jsonData: {
        path: ["users"],
        array_contains: ["test@gov.uk"],
      },
    },
    orderBy: {
      id: "asc",
    },
    include: {
      country: true,
    },
  });
});

test("hasAccessToList always returns true when super admin", async () => {
  expect(superAdmin.hasAccessToList(1)).toBeTruthy();
  expect(prisma.list).not.toHaveBeenCalled();
});

test("only superAdmins can create new lists", async () => {
  expect(superAdmin.hasAccessToList("new")).toBeTruthy();
  expect(prisma.list).not.toHaveBeenCalled();

  expect(user.hasAccessToList("new")).toBeFalsy();
  expect(prisma.list).not.toHaveBeenCalled();
});

test("hasAccessToList returns correct value", async () => {
  prisma.list.findFirst.mockResolvedValue(null);
  expect(await user.hasAccessToList(1)).toBe(false);

  prisma.list.findFirst.mockResolvedValue({ id: 1 });
  expect(await user.hasAccessToList(1)).toBe(true);
});
