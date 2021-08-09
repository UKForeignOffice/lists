import * as listModel from "server/models/list";
import { startRouteController } from "../dashboard";

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
            email: "testemail@govuk.com"
          },
          isSuperAdmin: jest.fn(),
          isListsCreator: jest.fn()
        }
      };

      mockRes = {
        render: jest.fn(),
      }
    })

    test("it renders correct template", async () => {
      mockFindUserLists(undefined);
      
      await startRouteController(mockReq, mockRes);      

      expect(mockRes.render.mock.calls[0][0]).toBe("dashboard/dashboard.html");
    });

    test("it calls findUserLists correctly", async () => {
      const usersLists: any = [{id: 1}];
      const spyFindUsersList = mockFindUserLists(usersLists);

      await startRouteController(mockReq, mockRes);

      expect(spyFindUsersList).toHaveBeenCalledWith(mockReq.user.userData.email);
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
      mockFindUserLists([{id: 1}]);
      
      await startRouteController(mockReq, mockRes);

      expect(mockRes.render.mock.calls[0][1].isNewUser).toBeFalsy();
    });

    test("a new user is correctly indicated via isNewUser view prop", async () => {
      mockFindUserLists(undefined);
      
      await startRouteController(mockReq, mockRes);

      expect(mockRes.render.mock.calls[0][1].isNewUser).toBeTruthy();
    });
  });
});
