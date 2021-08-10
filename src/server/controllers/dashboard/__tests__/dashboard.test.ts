import * as listModel from "server/models/list";
import { UserRoles } from "server/models/types";
import * as userModel from "server/models/user";
import {
  startRouteController,
  usersListController,
  usersEditController,
} from "../dashboard";

describe("Dashboard Controllers", () => {
  describe("startRouteController", () => {
    let mockReq: any;
    let mockRes: any;

    function mockFindUserLists(resolvedValue: any): jest.SpyInstance {
      return jest
        .spyOn(listModel, "findUserLists")
        .mockResolvedValueOnce(resolvedValue);
    }

    beforeEach(() => {
      mockReq = {
        user: {
          userData: {
            email: "testemail@govuk.com",
          },
          isSuperAdmin: jest.fn(),
          isListsCreator: jest.fn(),
        },
      };

      mockRes = {
        render: jest.fn(),
      };
    });

    test("it renders correct template", async () => {
      mockFindUserLists(undefined);

      await startRouteController(mockReq, mockRes);

      expect(mockRes.render.mock.calls[0][0]).toBe("dashboard/dashboard.html");
    });

    test("it calls findUserLists correctly", async () => {
      const usersLists: any = [{ id: 1 }];
      const spyFindUsersList = mockFindUserLists(usersLists);

      await startRouteController(mockReq, mockRes);

      expect(spyFindUsersList).toHaveBeenCalledWith(
        mockReq.user.userData.email
      );
    });

    test("it identifies a new user correctly", async () => {
      mockFindUserLists(undefined);
      mockReq.user.isSuperAdmin.mockReturnValueOnce(false);
      mockReq.user.isListsCreator.mockReturnValueOnce(false);

      await startRouteController(mockReq, mockRes);

      expect(mockRes.render.mock.calls[0][1].isNewUser).toBeTruthy();
    });

    test("a SuperAdmin is not a new user", async () => {
      mockFindUserLists(undefined);
      mockReq.user.isSuperAdmin.mockReturnValueOnce(true);

      await startRouteController(mockReq, mockRes);

      expect(mockRes.render.mock.calls[0][1].isNewUser).toBeFalsy();
    });

    test("a ListsCreator is not not a new user", async () => {
      mockFindUserLists(undefined);
      mockReq.user.isListsCreator.mockReturnValueOnce(true);

      await startRouteController(mockReq, mockRes);

      expect(mockRes.render.mock.calls[0][1].isNewUser).toBeFalsy();
    });

    test("a user with access to existing lists is not a new user", async () => {
      mockFindUserLists([{ id: 1 }]);

      await startRouteController(mockReq, mockRes);

      expect(mockRes.render.mock.calls[0][1].isNewUser).toBeFalsy();
    });

    test("a new user is correctly indicated via isNewUser view prop", async () => {
      mockFindUserLists(undefined);

      await startRouteController(mockReq, mockRes);

      expect(mockRes.render.mock.calls[0][1].isNewUser).toBeTruthy();
    });
  });

  describe("usersListController", () => {
    test("it renders correctly template with found users", async () => {
      const users: any = [{ id: 1 }];
      const spyFindUsers = jest
        .spyOn(userModel, "findUsers")
        .mockResolvedValueOnce(users);

      const mockReq: any = {};

      const mockRes: any = {
        render: jest.fn(),
      };

      await usersListController(mockReq, mockRes);

      expect(spyFindUsers).toHaveBeenCalled();
      expect(mockRes.render.mock.calls[0][0]).toBe("dashboard/users-list.html");
      expect(mockRes.render.mock.calls[0][1].users).toBe(users);
    });
  });

  describe("usersEditController", () => {
    let mockReq: any;
    let mockRes: any;
    let mockNext: any;

    beforeEach(() => {
      mockReq = {
        params: {
          userEmail: "user@gov.uk",
        },
        user: {
          userData: {
            email: "testemail@govuk.com",
          },
          isSuperAdmin: jest.fn(),
          isListsCreator: jest.fn(),
        },
      };

      mockRes = {
        render: jest.fn(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      mockNext = jest.fn();
    });

    test("it invokes next when userEmail param is not defined", async () => {
      mockReq.params.userEmail = undefined;
      await usersEditController(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });

    test("it returns 405 when trying to edit a SuperAdmin", async () => {
      const spyIsSuperAdmin = jest.spyOn(userModel, "isSuperAdminUser").mockResolvedValueOnce(true);

      await usersEditController(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(405);
      expect(mockRes.send).toHaveBeenCalledWith("Not allowed to edit super admin account");
      expect(spyIsSuperAdmin).toHaveBeenCalledWith(mockReq.params.userEmail);
    });

    test("it renders correct template with correct user value", async () => {
      jest.spyOn(userModel, "isSuperAdminUser").mockResolvedValueOnce(false);
      const userBeingEdited: any = { email: "userbeingEdited@gov.uk" };
      const spyFindUser = jest.spyOn(userModel, "findUserByEmail").mockResolvedValueOnce(userBeingEdited);
      
      await usersEditController(mockReq, mockRes, mockNext);

      expect(spyFindUser).toHaveBeenCalledWith(mockReq.params.userEmail);
      expect(mockRes.render.mock.calls[0][0]).toBe("dashboard/users-edit.html");
      expect(mockRes.render.mock.calls[0][1].user).toBe(userBeingEdited);
    });

    test("it correctly updates user removing SuperAdmin role", async () => {
      jest.spyOn(userModel, "isSuperAdminUser").mockResolvedValueOnce(false);
      const userBeingEdited: any = { email: "userbeingEdited@gov.uk" };
      const spyUpdateUser = jest.spyOn(userModel, "updateUser").mockResolvedValueOnce(userBeingEdited);

      mockReq.method = "POST";
      mockReq.body = {
        roles: `${UserRoles.SuperAdmin},${UserRoles.ListsCreator}`,
      }

      await usersEditController(mockReq, mockRes, mockNext);

      expect(spyUpdateUser).toHaveBeenCalledWith(mockReq.params.userEmail, {
        jsonData: {
          roles: [UserRoles.ListsCreator],
        }
      });
      expect(mockRes.render.mock.calls[0][1].userSaved).toBe(true);
    });

    test("next is invoked with updateUser error", async () => {
      const error = { message: "error" };
      jest.spyOn(userModel, "updateUser").mockRejectedValueOnce(error);
      jest.spyOn(userModel, "isSuperAdminUser").mockResolvedValueOnce(false);

      mockReq.method = "POST";
      mockReq.body = { roles: "" };

      await usersEditController(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
