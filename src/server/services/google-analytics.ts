import fetch from "node-fetch";
import { omitBy, isNil } from "lodash";
import { logger } from "server/services/logger";
import { GA_TRACKING_ID, GA_API_SECRET } from "server/config";
import { throwIfConfigVarIsUndefined } from "server/utils/validation";

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

export async function trackListsSearch(
  params: GA_Search_Params
): Promise<boolean> {
  const event: GA_Event = {
    name: "lists_search",
    params: omitBy(params, isNil),
  };

  try {
    return await postEvent(event);
  } catch (error) {
    logger.error(`Google Analytics trackListSearch Error: ${error.message}`);
    return false;
  }
}

async function postEvent(event: GA_Event): Promise<boolean> {
  throwIfConfigVarIsUndefined("GA_TRACKING_ID");
  throwIfConfigVarIsUndefined("GA_API_SECRET");

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
    logger.error(`Google Analytics Post Event Error: ${error.message}`);
    throw error;
  }
}
