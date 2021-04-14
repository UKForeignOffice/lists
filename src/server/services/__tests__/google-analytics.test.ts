import nock from "nock";
import { GA_TRACKING_ID , GA_API_SECRET } from "server/config";
import { trackListsSearch } from "../google-analytics";
import { logger } from "server/services/logger";

logger.error = jest.fn();

describe("Google Analytics service:", () => {
  const HOST = "https://www.google-analytics.com";
  const URL = `/mp/collect?measurement_id=${GA_TRACKING_ID}&api_secret=${GA_API_SECRET}`;
  
  test("trackListSearch event is posted correctly", () => {
    const params = {
      serviceType: "lawyers",
      country: "United Kingdom",
      region: "London",
      legalAid: "yes",
      practiceArea: "Maritime",
    };

    const expectedBody = JSON.stringify({
      client_id: "lists_server",
      events: [
        {
          name: "lists_search",
          params,
        },
      ],
    });

    const scope = nock(HOST).post(URL, expectedBody).reply(200);
    trackListsSearch(params);
    setTimeout(() => {
      expect(scope.isDone()).toBe(true);
    })
  });

  test("nil params are removed from posted event params object", () => {
    const params: any = {
      serviceType: "lawyers",
      country: "United Kingdom",
      region: undefined,
      legalAid: false,
      practiceArea: null,
    };

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
    trackListsSearch(params);
    setTimeout(() => {
      expect(scope.isDone()).toBe(true);
    })
  });

  test("Post event errors are logged", () => {
    const spyLogger = jest.spyOn(logger, "error");
    
    const scope = nock(HOST)
      .post(URL)
      .replyWithError("ERROR");
    trackListsSearch({});

    setTimeout(() => {
      expect(scope.isDone()).toBe(true);
      expect(spyLogger.mock.calls[0][0]).toBe(
        "Google Analytics Post Event Error:",
      );
    })
  })
});
