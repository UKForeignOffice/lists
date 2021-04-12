import fetch from "node-fetch";
import { GA_TRACKING_ID , GA_API_SECRET } from "config";
import { trackListsSearch } from "../google-analytics";

describe("Google Analytics service:", () => {
  test("trackListSearch event is posted correctly", () => {
    const params = {
      serviceType: "lawyers",
      country: "United Kingdom",
      region: "London",
      legalAid: "yes",
      practiceArea: "Maritime",
    };

    trackListsSearch(params);
    expect(fetch).toHaveBeenCalledWith(
      `https://www.google-analytics.com/mp/collect?measurement_id=${GA_TRACKING_ID}&api_secret=${GA_API_SECRET}`,
      {
        method: "POST",
        body: JSON.stringify({
          client_id: "lists_server",
          events: [
            {
              name: "lists_search",
              params,
            },
          ],
        }),
      }
    );
  });

  test("nil params are removed from posted event params object", () => {
    const params: any = {
      serviceType: "lawyers",
      country: "United Kingdom",
      region: undefined,
      legalAid: false,
      practiceArea: null,
    };

    trackListsSearch(params);
    expect(fetch).toHaveBeenCalledWith(
      `https://www.google-analytics.com/mp/collect?measurement_id=${GA_TRACKING_ID}&api_secret=${GA_API_SECRET}`,
      {
        method: "POST",
        body: JSON.stringify({
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
        }),
      }
    );
  });
});
