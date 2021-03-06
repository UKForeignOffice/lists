import { authRoutes } from "server/components/auth";
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
  listsEditController,
} from "../controllers";

describe("Dashboard Controllers", () => {
  let mockReq: any;
  let mockRes: any;
  let mockNext: any;
  let list: List;
  let spyFindListById: jest.SpyInstance;
  let spyUpdateList: jest.SpyInstance;
  let spyCreateList: jest.SpyInstance;

  beforeEach(() => {
    mockReq = {
      method: "GET",
      params: {
        userEmail: "user@gov.uk",
      },
      query: {},
      user: {
        userData: {
          email: "authemail@gov.uk",
        },
        isSuperAdmin: jest.fn(),
        isListsCreator: jest.fn(),
      },
    };

    mockRes = {
      render: jest.fn(),
      redirect: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    mockNext = jest.fn();

    spyFindListById = jest.spyOn(listModel, "findListById");
    spyCreateList = jest.spyOn(listModel, "createList");
    spyUpdateList = jest.spyOn(listModel, "updateList");

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
        administrators: [mockReq.user.userData.email],
      },
      countryId: 1,
    };
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

      await startRouteController(mockReq, mockRes, mockNext);

      expect(mockRes.render.mock.calls[0][0]).toBe("dashboard/dashboard.html");
    });

    test("it redirects to logout if req.user is undefined", async () => {
      mockReq.user = undefined;

      await startRouteController(mockReq, mockRes, mockNext);

      expect(mockRes.redirect).toHaveBeenCalledWith(authRoutes.logout);
    });

    test("it calls findUserLists correctly", async () => {
      const usersLists: any = [{ id: 1 }];
      const spyFindUsersList = mockFindUserLists(usersLists);

      await startRouteController(mockReq, mockRes, mockNext);

      expect(spyFindUsersList).toHaveBeenCalledWith(
        mockReq.user.userData.email
      );
    });

    test("it calls next with findUsersList error", async () => {
      const error = new Error("test error");
      jest.spyOn(listModel, "findUserLists").mockRejectedValueOnce(error);

      await startRouteController(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    test("it identifies a new user correctly", async () => {
      mockFindUserLists(undefined);
      mockReq.user.isSuperAdmin.mockReturnValueOnce(false);
      mockReq.user.isListsCreator.mockReturnValueOnce(false);

      await startRouteController(mockReq, mockRes, mockNext);

      expect(mockRes.render.mock.calls[0][1].isNewUser).toBeTruthy();
    });

    test("a SuperAdmin is not a new user", async () => {
      mockFindUserLists(undefined);
      mockReq.user.isSuperAdmin.mockReturnValueOnce(true);

      await startRouteController(mockReq, mockRes, mockNext);

      expect(mockRes.render.mock.calls[0][1].isNewUser).toBeFalsy();
    });

    test("a ListsCreator is not not a new user", async () => {
      mockFindUserLists(undefined);
      mockReq.user.isListsCreator.mockReturnValueOnce(true);

      await startRouteController(mockReq, mockRes, mockNext);

      expect(mockRes.render.mock.calls[0][1].isNewUser).toBeFalsy();
    });

    test("a user with access to existing lists is not a new user", async () => {
      mockFindUserLists([{ id: 1 }]);

      await startRouteController(mockReq, mockRes, mockNext);

      expect(mockRes.render.mock.calls[0][1].isNewUser).toBeFalsy();
    });

    test("a new user is correctly indicated via isNewUser view prop", async () => {
      mockFindUserLists(undefined);

      await startRouteController(mockReq, mockRes, mockNext);

      expect(mockRes.render.mock.calls[0][1].isNewUser).toBeTruthy();
    });
  });

  describe("usersListController", () => {
    test("it renders correctly template with found users", async () => {
      const users: any = [{ id: 1 }];
      const spyFindUsers = jest
        .spyOn(userModel, "findUsers")
        .mockResolvedValueOnce(users);

      await usersListController(mockReq, mockRes, mockNext);

      expect(spyFindUsers).toHaveBeenCalled();
      expect(mockRes.render.mock.calls[0][0]).toBe("dashboard/users-list.html");
      expect(mockRes.render.mock.calls[0][1].users).toBe(users);
    });

    test("it invokes next with findUsers error", async () => {
      const error = new Error("test error");
      jest.spyOn(userModel, "findUsers").mockRejectedValueOnce(error);

      await usersListController(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
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
    let listItems: any[];

    let spyFindListItemsForList: jest.SpyInstance;

    beforeEach(() => {
      listItems = [{ id: 1 }];

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

  describe("listsEditController", () => {
    test("it renders correct template for new list", async () => {
      mockReq.params.listId = "new";

      await listsEditController(mockReq, mockRes, mockNext);

      expect(spyFindListById).not.toHaveBeenCalled();
      expect(mockRes.render.mock.calls[0][0]).toBe("dashboard/lists-edit.html");
      expect(mockRes.render.mock.calls[0][1]).toContainKeys([
        "dashboardRoutes",
        "countriesList",
        "ServiceType",
        "userIsListPublisher",
        "userIsListPublisher",
        "userIsListValidator",
        "userIsListAdministrator",
        "req",
      ]);
      expect(mockRes.render.mock.calls[0][1]).toMatchObject({
        listId: "new",
        isPost: false,
        list: undefined,
        listCreated: undefined,
        listUpdated: undefined,
        error: {},
      });
    });

    test("it renders correct template for existing list", async () => {
      mockReq.params.listId = 1;
      spyFindListById.mockReturnValueOnce(list);

      await listsEditController(mockReq, mockRes, mockNext);

      expect(spyFindListById).toHaveBeenCalledWith(mockReq.params.listId);
      expect(mockRes.render.mock.calls[0][0]).toBe("dashboard/lists-edit.html");
      expect(mockRes.render.mock.calls[0][1].list).toBe(list);
    });

    describe("Create and Update", () => {
      beforeEach(() => {
        mockReq.body = {
          serviceType: "serviceType",
          country: "United Kingdom",
          administrators: "email@gov.uk",
          validators: "email@gov.uk",
          publishers: "email@gov.uk",
        };

        mockReq.method = "POST";
      });

      test("it errors when posting undefined serviceType", async () => {
        mockReq.params.listId = "new";
        mockReq.body.serviceType = undefined;

        await listsEditController(mockReq, mockRes, mockNext);

        expect(mockRes.render.mock.calls[0][1].error).toMatchObject({
          field: "serviceType",
          href: "#serviceType",
          text: "Please select service type",
        });
      });

      test("it errors when posting invalid country name", async () => {
        mockReq.params.listId = "new";
        mockReq.body.country = "London";

        await listsEditController(mockReq, mockRes, mockNext);

        expect(mockRes.render.mock.calls[0][1].error).toMatchObject({
          field: "country",
          href: "#country",
          text: "Invalid country name",
        });
      });

      test("it errors when posting empty administrators", async () => {
        mockReq.params.listId = "new";
        mockReq.body.administrators = "";

        await listsEditController(mockReq, mockRes, mockNext);

        expect(mockRes.render.mock.calls[0][1].error).toMatchObject({
          field: "administrators",
          href: "#administrators",
          text: "You must indicated at least one administrator",
        });
      });

      test("it errors when posting non gov.uk administrator email address", async () => {
        mockReq.params.listId = "new";
        mockReq.body.administrators = "email@gmail.com";

        await listsEditController(mockReq, mockRes, mockNext);

        expect(mockRes.render.mock.calls[0][1].error).toMatchObject({
          field: "administrators",
          href: "#administrators",
          text: "Administrators contain an invalid email address",
        });
      });

      test("it errors when posting empty validators", async () => {
        mockReq.params.listId = "new";
        mockReq.body.validators = "";

        await listsEditController(mockReq, mockRes, mockNext);

        expect(mockRes.render.mock.calls[0][1].error).toMatchObject({
          field: "validators",
          href: "#validators",
          text: "You must indicated at least one validator",
        });
      });

      test("it errors when posting non gov.uk validators email address", async () => {
        mockReq.params.listId = "new";
        mockReq.body.validators = "email@gmail.com";

        await listsEditController(mockReq, mockRes, mockNext);

        expect(mockRes.render.mock.calls[0][1].error).toMatchObject({
          field: "validators",
          href: "#validators",
          text: "Validators contain an invalid email address",
        });
      });

      test("it errors when posting empty publishers", async () => {
        mockReq.params.listId = "new";
        mockReq.body.publishers = "";

        await listsEditController(mockReq, mockRes, mockNext);

        expect(mockRes.render.mock.calls[0][1].error).toMatchObject({
          field: "publishers",
          href: "#publishers",
          text: "You must indicated at least one publisher",
        });
      });

      test("it errors when posting non gov.uk publishers email address", async () => {
        mockReq.params.listId = "new";
        mockReq.body.publishers = "email@gmail.com";

        await listsEditController(mockReq, mockRes, mockNext);

        expect(mockRes.render.mock.calls[0][1].error).toMatchObject({
          field: "publishers",
          href: "#publishers",
          text: "Publishers contain an invalid email address",
        });
      });

      test("it creates list and redirect correctly", async () => {
        mockReq.params.listId = "new";
        spyCreateList.mockResolvedValueOnce(list);

        await listsEditController(mockReq, mockRes, mockNext);

        expect(spyCreateList).toHaveBeenCalledWith({
          serviceType: "serviceType",
          country: "United Kingdom",
          administrators: ["email@gov.uk"],
          publishers: ["email@gov.uk"],
          validators: ["email@gov.uk"],
          createdBy: mockReq.user.userData.email,
        });
        expect(mockRes.redirect).toHaveBeenCalledWith(
          `/dashboard/lists/${list.id}?listCreated=true`
        );
      });

      test("it errors when trying to create a that already exists", async () => {
        mockReq.params.listId = "new";
        mockReq.body.serviceType = "covidTestProviders";

        const spyFindListByCountryAndType = jest
          .spyOn(listModel, "findListByCountryAndType")
          .mockResolvedValueOnce([list]);

        await listsEditController(mockReq, mockRes, mockNext);

        expect(spyCreateList).not.toHaveBeenCalled();
        expect(spyFindListByCountryAndType).toHaveBeenCalledWith(
          mockReq.body.country,
          mockReq.body.serviceType
        );
        expect(mockRes.render.mock.calls[0][1].error).toEqual({
          field: "serviceType",
          href: "#serviceType",
          text: "A Covid Test Providers list for United Kingdom already exists",
        });
      });

      test("it invokes next with createList error", async () => {
        mockReq.params.listId = "new";
        const err = new Error("createList error");
        spyCreateList.mockRejectedValueOnce(err);

        await listsEditController(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledWith(err);
      });

      test("it updates existing list and redirects correctly", async () => {
        mockReq.params.listId = list.id;
        list.jsonData.administrators = [mockReq.user.userData.email];

        spyFindListById.mockResolvedValueOnce(list);
        spyUpdateList.mockResolvedValueOnce(list);

        await listsEditController(mockReq, mockRes, mockNext);

        expect(spyFindListById).toHaveBeenCalledWith(list.id);
        expect(spyUpdateList.mock.calls[0][0]).toBe(1);
        expect(spyUpdateList).toHaveBeenCalledWith(list.id, {
          administrators: ["email@gov.uk"],
          publishers: ["email@gov.uk"],
          validators: ["email@gov.uk"],
        });
        expect(mockRes.redirect).toHaveBeenCalledWith(
          `/dashboard/lists/${list.id}?listUpdated=true`
        );
      });

      test("it invokes next with updateList error", async () => {
        mockReq.params.listId = list.id;
        list.jsonData.administrators = [mockReq.user.userData.email];

        const error = new Error("updateList error");
        spyFindListById.mockResolvedValueOnce(list);
        spyUpdateList.mockRejectedValueOnce(error);

        await listsEditController(mockReq, mockRes, mockNext);

        await listsEditController(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledWith(error);
      });

      test("it will not update a list the user is has no administrator right", async () => {
        mockReq.params.listId = list.id;
        list.jsonData.administrators = ["other@email.gov.uk"];

        spyFindListById.mockResolvedValue(list);
        spyUpdateList.mockResolvedValueOnce(list);

        await listsEditController(mockReq, mockRes, mockNext);

        expect(spyFindListById).toHaveBeenCalledWith(list.id);
        expect(spyUpdateList).not.toHaveBeenCalled();
      });

      test("it invokes next with findListById error", async () => {
        mockReq.params.listId = list.id;
        list.jsonData.administrators = ["other@email.gov.uk"];

        const error = new Error("updateList error");
        spyFindListById.mockResolvedValueOnce(error);

        await listsEditController(mockReq, mockRes, mockNext);

        expect(spyFindListById).toHaveBeenCalledWith(list.id);
        expect(spyUpdateList).not.toHaveBeenCalled();
      });
    });
  });
});
