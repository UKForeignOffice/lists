import nock from "nock";
import { trackListsSearch } from "../google-analytics";
import { logger } from "server/services/logger";

const { GA_API_SECRET, GA_TRACKING_ID } = process.env;

const mocks: { [name: string]: undefined | string } = {
  GA_API_SECRET,
  GA_TRACKING_ID,
};

jest.mock("server/config", () => ({
  get GA_API_SECRET() {
    return mocks.GA_API_SECRET;
  },
  get GA_TRACKING_ID() {
    return mocks.GA_TRACKING_ID;
  },
}));

describe("Google Analytics service:", () => {
  const HOST = "https://www.google-analytics.com";
  const URL = `/mp/collect?measurement_id=${GA_TRACKING_ID}&api_secret=${GA_API_SECRET}`;

  describe("trackListSearch", () => {
    let params: any;

    beforeEach(() => {
      params = {
        serviceType: "lawyers",
        country: "United Kingdom",
        region: "London",
        legalAid: "yes",
        practiceArea: "Maritime",
      };
    });

    test("trackListSearch event is posted correctly", async () => {
      const requestBody = JSON.stringify({
        client_id: "lists_server",
        events: [
          {
            name: "lists_search",
            params,
          },
        ],
      });
      const scope = nock(HOST).post(URL, requestBody).reply(200);

      await trackListsSearch(params);

      expect(scope.isDone()).toBe(true);
    });

    test("it returns false when post event rejects", async () => {
      const scope = nock(HOST).post(URL).replyWithError("Error message");

      const result = await trackListsSearch(params);

      expect(result).toBe(false);
      expect(scope.isDone()).toBe(true);
      expect(logger.error).toHaveBeenCalledWith(
        "Google Analytics Post Event Error: request to https://www.google-analytics.com/mp/collect?measurement_id=123ABC&api_secret=123ABC failed, reason: Error message"
      );
    });
  });

  describe("postEvent", () => {
    let params: any;

    beforeEach(() => {
      params = {
        serviceType: "lawyers",
        country: "United Kingdom",
        region: undefined,
        legalAid: false,
        practiceArea: null,
      };
    });

    test("it return false when GA_TRACKING_ID is undefined", async () => {
      mocks.GA_TRACKING_ID = undefined;

      const result = await trackListsSearch(params);

      expect(result).toBe(false);
      expect(logger.error).toHaveBeenCalledWith(
        "Google Analytics trackListSearch Error: Environment variable GA_TRACKING_ID is missing"
      );

      mocks.GA_TRACKING_ID = GA_TRACKING_ID;
    });

    test("it return false when GA_API_SECRET is undefined", async () => {
      mocks.GA_API_SECRET = undefined;

      const result = await trackListsSearch(params);

      expect(result).toBe(false);
      expect(logger.error).toHaveBeenCalledWith(
        "Google Analytics trackListSearch Error: Environment variable GA_API_SECRET is missing"
      );

      mocks.GA_API_SECRET = GA_API_SECRET;
    });

    test("nil params are removed from posted event params object", async () => {
      const expectedBody = JSON.stringify({
        client_id: "lists_server",
        events: [
          {
            name: "lists_search",
            params: {
              serviceType: "lawyers",
              country: "United Kingdom",
              legalAid: false,
            },
          },
        ],
      });
      const scope = nock(HOST).post(URL, expectedBody).reply(200);

      await trackListsSearch(params);

      expect(scope.isDone()).toBe(true);
    });

    test("Post event errors are logged", async () => {
      const spyLogger = jest.spyOn(logger, "error");
      const scope = nock(HOST).post(URL).replyWithError("ERROR");

      await trackListsSearch({});

      expect(scope.isDone()).toBe(true);
      expect(spyLogger.mock.calls[0][0]).toBe(
        "Google Analytics Post Event Error: request to https://www.google-analytics.com/mp/collect?measurement_id=123ABC&api_secret=123ABC failed, reason: ERROR"
      );
    });
  });
});
