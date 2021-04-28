import fetch from "node-fetch";
import { omitBy, isNil } from "lodash";
import { logger } from "server/services/logger";
import { GA_TRACKING_ID, GA_API_SECRET } from "server/config";

export interface GA_Search_Params {
  serviceType?: string;
  country?: string;
  region?: string;
  legalAid?: string;
  practiceArea?: string;
}

export interface GA_Event {
  name: string;
  params: GA_Search_Params;
}

export function trackListsSearch(params: GA_Search_Params): void {
  const event: GA_Event = {
    name: "lists_search",
    params: omitBy(params, isNil),
  };

  postEvent(event).catch((error) =>
    logger.error("Google Analytics trackListSearch Error:", error)
  );
}

async function postEvent(event: GA_Event): Promise<boolean> {
  if (GA_TRACKING_ID === undefined || GA_API_SECRET === undefined) {
    logger.error(
      "Google Analytics, missing environment variables GA_TRACKING_ID and GA_API_SECRET"
    );
    return false;
  }

  const url = `https://www.google-analytics.com/mp/collect?measurement_id=${GA_TRACKING_ID}&api_secret=${GA_API_SECRET}`;

  try {
    await fetch(url, {
      method: "POST",
      body: JSON.stringify({
        client_id: "lists_server",
        events: [event],
      }),
    });

    return true;
  } catch (error) {
    logger.error("Google Analytics Post Event Error:", error);
    return false;
  }
}
