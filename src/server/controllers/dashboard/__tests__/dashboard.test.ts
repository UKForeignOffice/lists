import * as listModel from "server/models/list";
import * as listItemModel from "server/models/listItem";
import { List, UserRoles } from "server/models/types";
import * as userModel from "server/models/user";
import {
  startRouteController,
  usersListController,
  usersEditController,
  listsController,
  listsItemsController,
} from "../dashboard";

describe("Dashboard Controllers", () => {
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
      send: jest.fn(),
    };

    mockNext = jest.fn();
  });

  describe("startRouteController", () => {
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
    test("it invokes next when userEmail param is not defined", async () => {
      mockReq.params.userEmail = undefined;
      await usersEditController(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });

    test("it returns 405 when trying to edit a SuperAdmin", async () => {
      const spyIsSuperAdmin = jest
        .spyOn(userModel, "isSuperAdminUser")
        .mockResolvedValueOnce(true);

      await usersEditController(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(405);
      expect(mockRes.send).toHaveBeenCalledWith(
        "Not allowed to edit super admin account"
      );
      expect(spyIsSuperAdmin).toHaveBeenCalledWith(mockReq.params.userEmail);
    });

    test("it invokes next with isSuperAdmin rejected error", async () => {
      const error = new Error("isSuperAdmin rejected");
      jest.spyOn(userModel, "isSuperAdminUser").mockRejectedValueOnce(error);

      await usersEditController(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    test("it renders correct template with correct user value", async () => {
      jest.spyOn(userModel, "isSuperAdminUser").mockResolvedValueOnce(false);
      const userBeingEdited: any = { email: "userbeingEdited@gov.uk" };
      const spyFindUser = jest
        .spyOn(userModel, "findUserByEmail")
        .mockResolvedValueOnce(userBeingEdited);

      await usersEditController(mockReq, mockRes, mockNext);

      expect(spyFindUser).toHaveBeenCalledWith(mockReq.params.userEmail);
      expect(mockRes.render.mock.calls[0][0]).toBe("dashboard/users-edit.html");
      expect(mockRes.render.mock.calls[0][1].user).toBe(userBeingEdited);
    });

    test("it correctly updates user removing SuperAdmin role", async () => {
      jest.spyOn(userModel, "isSuperAdminUser").mockResolvedValueOnce(false);
      const userBeingEdited: any = { email: "userbeingEdited@gov.uk" };
      const spyUpdateUser = jest
        .spyOn(userModel, "updateUser")
        .mockResolvedValueOnce(userBeingEdited);

      mockReq.method = "POST";
      mockReq.body = {
        roles: `${UserRoles.SuperAdmin},${UserRoles.ListsCreator}`,
      };

      await usersEditController(mockReq, mockRes, mockNext);

      expect(spyUpdateUser).toHaveBeenCalledWith(mockReq.params.userEmail, {
        jsonData: {
          roles: [UserRoles.ListsCreator],
        },
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

  describe("listsController", () => {
    let mockReq: any;
    let mockRes: any;
    let mockNext: any;

    beforeEach(() => {
      mockReq = {
        user: {
          userData: {
            email: "testemail@govuk.com",
          },
        },
      };

      mockRes = {
        render: jest.fn(),
        redirect: jest.fn(),
      };

      mockNext = jest.fn();
    });

    test("it redirects if authenticated user email address is not defined", async () => {
      mockReq.user.userData.email = undefined;
      await listsController(mockReq, mockRes, mockNext);
      expect(mockRes.redirect).toHaveBeenCalledWith("/logout");
    });

    test("it renders correct template with found lists", async () => {
      const lists: any = [{ id: 1 }];
      const spy = jest
        .spyOn(listModel, "findUserLists")
        .mockResolvedValueOnce(lists);

      await listsController(mockReq, mockRes, mockNext);

      expect(spy).toHaveBeenCalledWith(mockReq.user.userData.email);
      expect(mockRes.render.mock.calls[0][0]).toBe("dashboard/lists.html");
      expect(mockRes.render.mock.calls[0][1].lists).toBe(lists);
    });

    test("it renders correct with empty list when findUserLists result is undefined", async () => {
      const lists: any = undefined;
      jest.spyOn(listModel, "findUserLists").mockResolvedValueOnce(lists);

      await listsController(mockReq, mockRes, mockNext);

      expect(mockRes.render.mock.calls[0][1].lists).toBeArrayOfSize(0);
    });

    test("it invokes next with findUserLists error", async () => {
      const error = { message: "error" };
      jest.spyOn(listModel, "findUserLists").mockRejectedValueOnce(error);

      await listsController(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("listsItemsController", () => {
    let list: List;
    let listItems: any[];
    let spyFindListById: jest.SpyInstance;
    let spyFindListItemsForList: jest.SpyInstance;

    beforeEach(() => {
      list = {
        id: 1,
        reference: "123reference",
        createdAt: new Date(),
        updatedAt: new Date(),
        type: "covidTestProviders",
        jsonData: {
          title: "test",
          validators: [],
          publishers: [],
          administrators: [],
        },
        countryId: 1,
      };

      listItems = [{ id: 1 }];

      spyFindListById = jest.spyOn(listModel, "findListById");
      spyFindListItemsForList = jest.spyOn(
        listItemModel,
        "findListItemsForList"
      );
    });

    test("it renders correctly", async () => {
      spyFindListById.mockResolvedValueOnce(list);
      spyFindListItemsForList.mockResolvedValueOnce(listItems);

      mockReq.params.listId = 1;

      await listsItemsController(mockReq, mockRes, mockNext);

      const renderCall = mockRes.render.mock.calls[0];
      expect(spyFindListById).toHaveBeenCalledWith(mockReq.params.listId);
      expect(renderCall[0]).toBe("dashboard/lists-items.html");
      expect(renderCall[1].list).toBe(list);
      expect(renderCall[1].listItems).toBe(listItems);
      expect(renderCall[1].canApprove).toBeFalse();
      expect(renderCall[1].canPublish).toBeFalse();
    });

    test("it invokes next when list is not found", async () => {
      spyFindListById.mockResolvedValueOnce(undefined);

      await listsItemsController(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(spyFindListItemsForList).not.toHaveBeenCalled();
    });

    test("it invokes next with findListById error", async () => {
      const error = { message: "error" };
      spyFindListById.mockRejectedValueOnce(error);

      await listsItemsController(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
      expect(spyFindListItemsForList).not.toHaveBeenCalled();
    });

    test("it invokes next with findListItemsForList error", async () => {
      const error = { message: "error" };
      spyFindListById.mockResolvedValueOnce(list);
      spyFindListItemsForList.mockRejectedValueOnce(error);

      await listsItemsController(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockRes.render).not.toHaveBeenCalled();
    });

    test("template property canApprove is correct when user is list validator", async () => {
      list.jsonData.validators = [mockReq.user.userData.email];
      spyFindListById.mockResolvedValueOnce(list);
      spyFindListItemsForList.mockResolvedValueOnce(listItems);

      await listsItemsController(mockReq, mockRes, mockNext);

      expect(mockRes.render.mock.calls[0][1].canApprove).toBeTrue();
      expect(mockRes.render.mock.calls[0][1].canPublish).toBeFalse();
    });

    test("template property canPublish is correct when user is list publisher", async () => {
      list.jsonData.publishers = [mockReq.user.userData.email];
      spyFindListById.mockResolvedValueOnce(list);
      spyFindListItemsForList.mockResolvedValueOnce(listItems);

      await listsItemsController(mockReq, mockRes, mockNext);

      expect(mockRes.render.mock.calls[0][1].canApprove).toBeFalse();
      expect(mockRes.render.mock.calls[0][1].canPublish).toBeTrue();
    });
  });
});
