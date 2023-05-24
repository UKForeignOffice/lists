import { NotifyClient } from "notifications-node-client";
import * as config from "server/config";
import { get } from "lodash";

export function getNotifyClient() {
  // TODO: Use NotifyClient type instead of any
  let notifyClient: any;

  if (notifyClient === undefined) {
    const requiredTemplateIds = ["NOTIFY.apiKey"];

    requiredTemplateIds.forEach(throwIfConfigVarIsUndefined);
    if (config.isSmokeTest) {
      return new FakeNotifyClient();
    }

    notifyClient = new NotifyClient(config.NOTIFY.apiKey);
  }

  return notifyClient;
}

class FakeNotifyClient {
  sendEmail() {
    return { statusText: "Created" };
  }
}

export function throwIfConfigVarIsUndefined(varName: string): void {
  if (!get(config, varName)) {
    throw new Error(`Server config variable ${varName} is missing`);
  }
}
