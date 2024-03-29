import { authRoutes } from "server/components/auth";
import { List, BaseListItemGetObject } from "server/models/types";
import { ServiceType } from "shared/types";
import * as userModel from "server/models/user";
import * as listModel from "server/models/list";
import * as listItemModel from "server/models/listItem/listItem";

import {
  startRouteController,
  usersEditController,
  usersEditPostController,
  usersListController,
} from "../controllers";

import * as govukNotify from "../../../../services/govuk-notify";
import * as helpers from "server/components/dashboard/helpers";
import { NextFunction } from "express";
import { listItemGetController } from "server/components/dashboard/listsItems/controllers";
import { Status } from "@prisma/client";
import { requestValidation } from "../../listsItems/requestValidation";
import { getAnnualReviewDate } from "server/components/dashboard/annualReview/helpers";
import { listsController } from "../listsController";
import { listItemsIndexController } from "../../listsItems/listItemsIndexController";

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
        userEmail: "user@fcdo.gov.uk",
      },
      query: {},
      user: {
        userData: {
          email: "authemail@fcdo.gov.uk",
        },
        isAdministrator: false,
        getLists: jest.fn(),
        hasAccessToList: jest.fn(),
      },
      flash: jest.fn(),
      isUnauthenticated: jest.fn().mockReturnValue(false),
      isAuthenticated: jest.fn().mockReturnValue(true),
      session: {},
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
      nextAnnualReviewStartDate: new Date("01-Jan-2023"),
      lastAnnualReviewStartDate: new Date("01-Jan-2022"),
      isAnnualReview: false,
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
      publishingStatus: "live",
      activityStatus: {
        text: "Check new entry",
        type: "to_do",
      },
      reference: "TEST-UUID",
      type: "lawyers",
      createdAt: new Date(),
      updatedAt: new Date(),
      jsonData: {
        emailAddressToPublish: undefined,
      },
      listId: 1,
      status: Status.NEW,
      history: [],
      isAnnualReview: false,
    };
  });

  describe("startRouteController", () => {
    test("it redirects to logout if the user is not authenticated", async () => {
      mockReq.isUnauthenticated.mockResolvedValueOnce(true);

      await startRouteController(mockReq, mockRes, mockNext);

      expect(mockRes.redirect).toHaveBeenCalledWith(authRoutes.logout);
    });
  });

  describe("usersListController", () => {
    test("it renders correctly template with found users", async () => {
      const users: any = [{ id: 1 }];
      const spygetUsersWithList = jest.spyOn(userModel, "getUsersWithList").mockResolvedValueOnce(users);

      await usersListController(mockReq, mockRes, mockNext);

      expect(spygetUsersWithList).toHaveBeenCalled();
      expect(mockRes.render.mock.calls[0][0]).toBe("dashboard/users-list");
      expect(mockRes.render.mock.calls[0][1].users).toBe(users);
    });

    test("it invokes next with getUsersWithList error", async () => {
      const error = new Error("test error");
      jest.spyOn(userModel, "getUsersWithList").mockRejectedValueOnce(error);

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
      const userBeingEdited: any = { email: "userbeingEdited@fcdo.gov.uk" };
      jest.spyOn(userModel, "isAdministrator").mockResolvedValue(false);
      const spyFindUser = jest.spyOn(userModel, "findUserByEmail").mockResolvedValue(userBeingEdited);

      await usersEditController(mockReq, mockRes, mockNext);

      expect(spyFindUser).toHaveBeenCalledWith(mockReq.params.userEmail);
      expect(mockRes.render.mock.calls[0][0]).toBe("dashboard/users-edit");
      expect(mockRes.render.mock.calls[0][1].user).toBe(userBeingEdited);
    });
  });

  describe("usersEditPostController", () => {
    test("next invoked when user updated but they do not have Administrator role", async () => {
      jest.spyOn(userModel, "findUserByEmail").mockResolvedValue(mockReq.user);
      jest.spyOn(userModel, "isAdministrator").mockResolvedValueOnce(false);

      const userBeingEdited: any = { email: "userbeingEdited@fcdo.gov.uk" };
      const spyUpdateUser = jest.spyOn(userModel, "updateUser").mockResolvedValueOnce(userBeingEdited);

      mockReq.method = "POST";
      mockReq.body = {
        roles: ``,
      };

      await usersEditPostController(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(expect.anything());
    });

    test("next is invoked with updateUser error", async () => {
      const error = { message: "error" };
      jest.spyOn(userModel, "isAdministrator").mockResolvedValue(true);
      jest.spyOn(userModel, "updateUser").mockRejectedValueOnce(error);
      mockReq.method = "POST";
      mockReq.user.userData.email = "user@fcdo.gov.uk";
      mockReq.body = { roles: "${UserRoles.Administrator}" };

      await usersEditPostController(mockReq, mockRes, mockNext);
      expect(mockRes.redirect).toHaveBeenCalledWith(`/dashboard/users/user@fcdo.gov.uk`);
    });
  });

  describe("listsController", () => {
    test("it redirects if authenticated user email address is not defined", async () => {
      jest.spyOn(mockReq, "isUnauthenticated").mockReturnValueOnce(true);

      await listsController(mockReq, mockRes, mockNext);
      expect(mockRes.redirect).toHaveBeenCalledWith("/logout");
    });

    test("it renders correct template with found lists", async () => {
      const lists: any = [{ id: 1, nextAnnualReviewStartDate: null, lastAnnualReviewStartDate: null }];
      mockReq.user.getLists.mockResolvedValueOnce(lists);

      await listsController(mockReq, mockRes, mockNext);

      expect(mockRes.render.mock.calls[0][0]).toBe("dashboard/lists");
      expect(mockRes.render.mock.calls[0][1].lists).toStrictEqual(lists);
    });

    test("it renders correct with empty list when user.getLists result is empty", async () => {
      mockReq.user.getLists.mockResolvedValueOnce([]);
      await listsController(mockReq, mockRes, mockNext);

      expect(mockRes.render.mock.calls[0][1].lists).toBeArrayOfSize(0);
    });

    test("it identifies a new user correctly", async () => {
      mockReq.user.getLists.mockResolvedValueOnce([]);
      mockReq.user.isAdministrator = false;

      await listsController(mockReq, mockRes, mockNext);

      expect(mockRes.render.mock.calls[0][1].isNewUser).toBeTruthy();
    });

    test("a SuperAdmin is not a new user", async () => {
      mockReq.user.getLists.mockResolvedValueOnce([{ id: 1 }, { id: 2 }]);
      mockReq.user.isAdministrator = true;

      await listsController(mockReq, mockRes, mockNext);

      expect(mockRes.render.mock.calls[0][1].isNewUser).toBeFalsy();
    });

    test("a user with access to existing lists is not a new user", async () => {
      mockReq.user.getLists.mockResolvedValueOnce([{ id: 1 }]);

      await listsController(mockReq, mockRes, mockNext);

      expect(mockRes.render.mock.calls[0][1].isNewUser).toBeFalsy();
    });

    test("a new user is correctly indicated via isNewUser view prop", async () => {
      mockReq.user.getLists.mockResolvedValueOnce([]);
      await listsController(mockReq, mockRes, mockNext);

      expect(mockRes.render.mock.calls[0][1].isNewUser).toBeTruthy();
    });
  });

  describe("listItemsIndexController", () => {
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

      await listItemsIndexController(mockReq, mockRes, mockNext);

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

      await listItemsIndexController(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(spyFindListItemsForList).not.toHaveBeenCalled();
    });

    test.skip("it invokes next with findListById error", async () => {
      const error = { message: "error" };
      spyFindListById.mockRejectedValueOnce(error);

      await listItemsIndexController(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
      expect(spyFindListItemsForList).not.toHaveBeenCalled();
    });

    test.skip("it invokes next with findListItemsForList error", async () => {
      const error = { message: "error" };
      spyFindListById.mockResolvedValueOnce(list);
      spyFindListItemsForList.mockRejectedValueOnce(error);

      await listItemsIndexController(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockRes.render).not.toHaveBeenCalled();
    });

    test.skip("template property canApprove is correct when user is list validator", async () => {
      list.jsonData.validators = [mockReq.user.userData.email];
      spyFindListById.mockResolvedValueOnce(list);
      spyFindListItemsForList.mockResolvedValueOnce(listItems);

      await listItemsIndexController(mockReq, mockRes, mockNext);

      expect(mockRes.render.mock.calls[0][1].canApprove).toBeTrue();
      expect(mockRes.render.mock.calls[0][1].canPublish).toBeFalse();
    });

    test.skip("template property canPublish is correct when user is list publisher", async () => {
      list.jsonData.publishers = [mockReq.user.userData.email];
      spyFindListById.mockResolvedValueOnce(list);
      spyFindListItemsForList.mockResolvedValueOnce(listItems);

      await listItemsIndexController(mockReq, mockRes, mockNext);

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

      mockRes.locals = { list, listItem };

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
      mockReq = { ...mockReq, flash: jest.fn(() => [1]) };
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

      expect(spyGetInitiateFormRunnerSessionToken).toHaveBeenCalledTimes(1);
      expect(spySendEditDetailsEmail).toHaveBeenCalledTimes(1);
      expect(1).toBe(1);
    });
  });

  describe("getAnnualReviewDate", () => {
    jest.useFakeTimers().setSystemTime(new Date(1670944983729)); // Current date to 2022-12-13

    it("returns valid date if within 6 months of last annual review", () => {
      // when
      const result = getAnnualReviewDate("1", "2");

      // then
      expect(result.value).toBeTruthy();
    });

    it("returns invalid date if over 6 months of last annual review", () => {
      // when
      const result = getAnnualReviewDate("1", "8");
      // then
      expect(result.value).toBeFalsy();
      expect(result.errorMsg).toEqual("You can only change the date up to 6 months after the current date");
    });

    it("returns invalid date if user enters Feb 29th", () => {
      // when
      const result = getAnnualReviewDate("29", "2");

      // then
      expect(result.value).toBeFalsy();
      expect(result.errorMsg).toEqual("You cannot set the annual review to this date. Please choose another");
    });

    it("returns a different year if the user select January within 6 months of annual review", () => {
      // when
      jest.useFakeTimers().setSystemTime(new Date(1698796800000)); // Current date to 2023-11-01
      const result = getAnnualReviewDate("1", "1");

      // then
      expect(result.value).toBeTruthy();
      expect(result.value).toEqual(new Date("2024-01-01"));
    });
  });
});
