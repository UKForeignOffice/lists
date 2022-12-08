import { authRoutes } from "server/components/auth";
import { List, BaseListItemGetObject, ServiceType, UserRoles } from "server/models/types";
import * as userModel from "server/models/user";
import * as listModel from "server/models/list";
import * as listItemModel from "server/models/listItem/listItem";

import {
  listsController,
  listsItemsController,
  startRouteController,
  usersEditController,
  usersEditPostController,
  usersListController,
} from "../controllers";
import * as govukNotify from "../../../services/govuk-notify";
import * as helpers from "server/components/dashboard/helpers";
import { NextFunction } from "express";
import { listItemGetController } from "server/components/dashboard/listsItems/controllers";
import { Status } from "@prisma/client";
import { requestValidation } from "../listsItems/requestValidation";
import { HttpException } from "../../../middlewares/error-handlers";
import { getAnnualReviewDate } from "server/components/dashboard/annualReview/Helpers";

jest.useFakeTimers("modern");

describe("Dashboard Controllers", () => {
  let mockReq: any;
  let mockRes: any;
  let mockNext: any;
  let list: List;
  let listItem: BaseListItemGetObject;
  let spyFindListItemById: jest.SpyInstance;
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
        isAdministrator: jest.fn(),
        getLists: jest.fn(),
        hasAccessToList: jest.fn(),
      },
      flash: jest.fn(),
      isUnauthenticated: jest.fn().mockReturnValue(false),
      isAuthenticated: jest.fn().mockReturnValue(true),
    };

    mockRes = {
      json: jest.fn(),
      render: jest.fn(),
      redirect: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      locals: {
        list,
        listItem,
      },
    };

    mockNext = jest.fn();

    spyFindListById = jest.spyOn(listModel, "findListById");
    spyFindListItemById = jest.spyOn(listItemModel, "findListItemById");
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
        users: [mockReq.user.userData.email],
      },
      countryId: 1,
    };

    listItem = {
      addressId: 11,
      address: {
        firstLine: "1 Street",
        secondLine: "",
        city: "City",
        postCode: "PO5T CDE",
        country: {
          id: 1,
          name: "Italy",
        },
        geoLocationId: 123,
      },
      id: 2,
      isApproved: true,
      isBlocked: false,
      isPublished: true,
      reference: "TEST-UUID",
      type: "lawyers",
      createdAt: new Date(),
      updatedAt: new Date(),
      jsonData: {
        emailAddressToPublish: undefined,
      },
      listId: 1,
      status: Status.NEW,
    };
  });

  describe("startRouteController", () => {
    test("it redirects to logout if the user is not authenticated", async () => {
      mockReq.isUnauthenticated.mockResolvedValueOnce(true);

      await startRouteController(mockReq, mockRes, mockNext);

      expect(mockRes.redirect).toHaveBeenCalledWith(authRoutes.logout);
    });

    test("it identifies a new user correctly", async () => {
      mockReq.user.getLists.mockResolvedValueOnce([]);
      mockReq.user.isAdministrator.mockReturnValueOnce(false);

      await startRouteController(mockReq, mockRes, mockNext);

      expect(mockRes.render.mock.calls[0][1].isNewUser).toBeTruthy();
    });

    test("a SuperAdmin is not a new user", async () => {
      mockReq.user.getLists.mockResolvedValueOnce([]);
      mockReq.user.isAdministrator.mockReturnValueOnce(true);

      await startRouteController(mockReq, mockRes, mockNext);

      expect(mockRes.render.mock.calls[0][1].isNewUser).toBeFalsy();
    });

    test("a user with access to existing lists is not a new user", async () => {
      mockReq.user.getLists.mockResolvedValueOnce([{ id: 1 }]);

      await startRouteController(mockReq, mockRes, mockNext);

      expect(mockRes.render.mock.calls[0][1].isNewUser).toBeFalsy();
    });

    test("a new user is correctly indicated via isNewUser view prop", async () => {
      mockReq.user.getLists.mockResolvedValueOnce([]);
      await startRouteController(mockReq, mockRes, mockNext);

      expect(mockRes.render.mock.calls[0][1].isNewUser).toBeTruthy();
    });
  });

  describe("usersListController", () => {
    test("it renders correctly template with found users", async () => {
      const users: any = [{ id: 1 }];
      const spyFindUsers = jest.spyOn(userModel, "findUsers").mockResolvedValueOnce(users);

      await usersListController(mockReq, mockRes, mockNext);

      expect(spyFindUsers).toHaveBeenCalled();
      expect(mockRes.render.mock.calls[0][0]).toBe("dashboard/users-list");
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

    test("it renders correct template with correct user value", async () => {
      const userBeingEdited: any = { email: "userbeingEdited@gov.uk" };
      jest.spyOn(userModel, "isAdministrator").mockResolvedValue(false);
      const spyFindUser = jest.spyOn(userModel, "findUserByEmail").mockResolvedValue(userBeingEdited);

      await usersEditController(mockReq, mockRes, mockNext);

      expect(spyFindUser).toHaveBeenCalledWith(mockReq.params.userEmail);
      expect(mockRes.render.mock.calls[0][0]).toBe("dashboard/users-edit");
      expect(mockRes.render.mock.calls[0][1].user).toBe(userBeingEdited);
    });
  });

  describe("usersEditPostController", () => {
    test("it correctly updates user removing SuperAdmin role", async () => {
      jest.spyOn(userModel, "findUserByEmail").mockResolvedValue(mockReq.user);
      jest.spyOn(userModel, "isAdministrator").mockResolvedValueOnce(false);

      const userBeingEdited: any = { email: "userbeingEdited@gov.uk" };
      const spyUpdateUser = jest.spyOn(userModel, "updateUser").mockResolvedValueOnce(userBeingEdited);

      mockReq.method = "POST";
      mockReq.body = {
        roles: `${UserRoles.Administrator}`,
      };

      await usersEditPostController(mockReq, mockRes, mockNext);
      expect(spyUpdateUser).toHaveBeenCalledWith(mockReq.params.userEmail, {
        jsonData: {
          roles: [UserRoles.Administrator],
        },
      });
      expect(mockRes.redirect).toHaveBeenCalledWith("/dashboard/users");
    });

    test("next is invoked with updateUser error", async () => {
      const error = { message: "error" };
      jest.spyOn(userModel, "isAdministrator").mockResolvedValue(true);
      jest.spyOn(userModel, "updateUser").mockRejectedValueOnce(error);
      mockReq.method = "POST";
      mockReq.body = { roles: "" };

      await usersEditPostController(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(new HttpException(405, "405", "Not allowed to edit super admin account"));
    });
  });

  describe("listsController", () => {
    test("it redirects if authenticated user email address is not defined", async () => {
      jest.spyOn(mockReq, "isUnauthenticated").mockReturnValueOnce(true);

      await listsController(mockReq, mockRes, mockNext);
      expect(mockRes.redirect).toHaveBeenCalledWith("/logout");
    });

    test("it renders correct template with found lists", async () => {
      const lists = [{ id: 1 }];
      mockReq.user.getLists.mockResolvedValueOnce(lists);

      await listsController(mockReq, mockRes, mockNext);

      expect(mockRes.render.mock.calls[0][0]).toBe("dashboard/lists");
      expect(mockRes.render.mock.calls[0][1].lists).toBe(lists);
    });

    test("it renders correct with empty list when user.getLists result is empty", async () => {
      mockReq.user.getLists.mockResolvedValueOnce([]);
      await listsController(mockReq, mockRes, mockNext);

      expect(mockRes.render.mock.calls[0][1].lists).toBeArrayOfSize(0);
    });
  });

  describe("listsItemsController", () => {
    let listItems: any[];

    let spyFindListItemsForList: jest.SpyInstance;

    beforeEach(() => {
      listItems = [{ id: 1 }];

      spyFindListItemsForList = jest.spyOn(listItemModel, "findListItemsForList");
    });

    test.skip("it renders correctly", async () => {
      spyFindListById.mockResolvedValueOnce(list);
      spyFindListItemsForList.mockResolvedValueOnce(listItems);

      mockReq.params.listId = 1;

      await listsItemsController(mockReq, mockRes, mockNext);

      const renderCall = mockRes.render.mock.calls[0];
      expect(spyFindListById).toHaveBeenCalledWith(mockReq.params.listId);
      expect(renderCall[0]).toBe("dashboard/lists-items");
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

    test.skip("it invokes next with findListById error", async () => {
      const error = { message: "error" };
      spyFindListById.mockRejectedValueOnce(error);

      await listsItemsController(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
      expect(spyFindListItemsForList).not.toHaveBeenCalled();
    });

    test.skip("it invokes next with findListItemsForList error", async () => {
      const error = { message: "error" };
      spyFindListById.mockResolvedValueOnce(list);
      spyFindListItemsForList.mockRejectedValueOnce(error);

      await listsItemsController(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockRes.render).not.toHaveBeenCalled();
    });

    test.skip("template property canApprove is correct when user is list validator", async () => {
      list.jsonData.validators = [mockReq.user.userData.email];
      spyFindListById.mockResolvedValueOnce(list);
      spyFindListItemsForList.mockResolvedValueOnce(listItems);

      await listsItemsController(mockReq, mockRes, mockNext);

      expect(mockRes.render.mock.calls[0][1].canApprove).toBeTrue();
      expect(mockRes.render.mock.calls[0][1].canPublish).toBeFalse();
    });

    test.skip("template property canPublish is correct when user is list publisher", async () => {
      list.jsonData.publishers = [mockReq.user.userData.email];
      spyFindListById.mockResolvedValueOnce(list);
      spyFindListItemsForList.mockResolvedValueOnce(listItems);

      await listsItemsController(mockReq, mockRes, mockNext);

      expect(mockRes.render.mock.calls[0][1].canApprove).toBeFalse();
      expect(mockRes.render.mock.calls[0][1].canPublish).toBeTrue();
    });
  });

  describe("listItemsEditGetController", () => {
    let next: NextFunction;

    beforeEach(() => {
      process.env.LOCAL_HOST = "true";

      mockReq.params = {
        listId: "1",
        listItemId: "2",
      };
      mockReq.body = {
        message: "change the text",
      };
      mockReq.user.userData.id = 3;
      listItem.type = ServiceType.lawyers;
      list.type = ServiceType.lawyers;

      jest.spyOn(listItemModel, "findListItemById").mockResolvedValue({
        ...listItem,
        address: {
          firstLine: "Line 1",
          postCode: "ABC 123",
          city: "Test",
          country: {
            id: 99,
            name: "Germany",
          },
        },
      });
      next = jest.fn();
    });

    it("should call editListItem with the correct params", async () => {
      await listItemGetController(mockReq, mockRes);

      expect(mockRes.render.mock.calls[0][0]).toBe("dashboard/lists-item");
      expect(mockRes.render.mock.calls[0][1].listItem).toStrictEqual(listItem);
    });
  });

  describe("listItemsEditPostController", () => {
    let next: NextFunction;

    beforeEach(() => {
      mockReq.params = {
        listId: "1",
        listItemId: "2",
      };
      mockReq.body = {
        message: "change the text",
      };
      mockReq.user.userData.id = 3;
      listItem.type = ServiceType.lawyers;
      list.type = ServiceType.lawyers;

      jest.spyOn(listItemModel, "findListItemById").mockResolvedValue({
        ...listItem,
        address: {
          firstLine: "Line 1",
          postCode: "ABC 123",
          city: "Test",
          country: {
            id: 99,
            name: "Germany",
          },
        },
      });

      next = jest.fn();
    });

    it("should return a 400 if list service type differs to list item service type", async () => {
      mockReq.user.hasAccessToList.mockResolvedValueOnce(true);
      mockRes.locals.listItem = { type: "lawyers" };
      mockRes.locals.list = { type: "funeralDirectors" };

      const next = jest.fn();

      await requestValidation(mockReq, mockRes, next);
      const err = next.mock.calls[0][0];
      expect(err.status).toBe(400);
      expect(err.message).toContain("Trying to edit a list item which is a different service type");
    });

    it("should return a 400 if list item not associated with the list", async () => {
      mockReq.isUnauthenticated.mockReturnValueOnce(false);
      mockReq.user.hasAccessToList.mockResolvedValueOnce(true);
      mockRes.locals.list = {
        id: 1,
        type: "lawyers",
      };
      mockRes.locals.listItem = { id: 2, listId: 2, type: "lawyers" };

      const next = jest.fn();

      await requestValidation(mockReq, mockRes, next);

      const err = next.mock.calls[0][0];

      expect(err.status).toBe(400);
      expect(err.message).toContain("Trying to edit a list item which does not belong to list 1");
    });

    it.skip("should call editListItem with the correct params", async () => {
      spyFindListById.mockResolvedValueOnce(list);
      spyFindListItemById.mockResolvedValueOnce(listItem);

      const spyGetInitiateFormRunnerSessionToken = jest
        .spyOn(helpers, "getInitiateFormRunnerSessionToken")
        .mockResolvedValue("string");

      const spySendEditDetailsEmail = jest.spyOn(govukNotify, "sendEditDetailsEmail");

      // await dashboardControllers.listItemPostConfirmationController(mockReq, mockRes);

      expect(spyGetInitiateFormRunnerSessionToken).toHaveBeenCalledTimes(1);
      expect(spySendEditDetailsEmail).toHaveBeenCalledTimes(1);
      expect(1).toBe(1);
    });
  });


  describe.only("getAnnualReviewDate", () => {
    const list = {
      jsonData: {
        lastAnnualReviewStartDate: new Date("1/1/2022"),
        annualReviewStartDate: new Date("1/1/2023")
      }
    };

    const annualReviewInNov = {
      jsonData: {
        lastAnnualReviewStartDate: new Date("11/1/2022"),
        annualReviewStartDate: new Date("11/1/2023")
      }
    };

    const annualReviewCloseToLast = {
      jsonData: {
        lastAnnualReviewStartDate: new Date("11/1/2022"),
        annualReviewStartDate: new Date("4/1/2024")
      }
    }

    it("returns valid date if within 6 months of last annual review", () => {
      // when
      const result = getAnnualReviewDate({
        day: "1",
        month: "2",
        list,
      });

      // then
      expect(result.value).toBeTruthy();
    });

    it("returns invalid date if over 6 months of last annual review", () => {
      // when
      const result = getAnnualReviewDate({
        day: "1",
        month: "8",
        list,
      });

      // then
      expect(result.value).toBeFalsy();
      expect(result.errorMsg).toEqual("You can only change the date up to 6 months after the current review date");
    });

    it("returns invalid date if user enters Feb 29th", () => {
      // when
      const result = getAnnualReviewDate({
        day: "29",
        month: "2",
        list,
      });

      // then
      expect(result.value).toBeFalsy();
      expect(result.errorMsg).toEqual("You cannot set the annual review to this date. Please choose another");
    });

    it("returns a different year if the user select January within 6 months of annual review", () => {
      // when
      const result = getAnnualReviewDate({
        day: "1",
        month: "1",
        list: annualReviewInNov,
      });


      // then
      expect(result.value).toBeTruthy();
      expect(result.value).toEqual(new Date("1/1/2024"));
    });

    it("returns inValid if date exceeds max date from last annual review plus one year", () => {
      // when
      const result = getAnnualReviewDate({
        day: "1",
        month: "6",
        list: annualReviewCloseToLast,
      });

      // then
      expect(result.value).toBeFalsy();
      expect(result.errorMsg).toEqual("You can only change the date up to 6 months after the current review date");
    });
  });

  function mockNextFunction(expectedStatus: number, expectedMessage: string): NextFunction {
    const next: NextFunction = (err) => {
      expect(err.message).toBe(expectedMessage)
      expect(err.status).toBe(expectedStatus)
    };
    return next;
  }
});
