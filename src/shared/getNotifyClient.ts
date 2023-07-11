import { NotifyClient } from "notifications-node-client";
import * as config from "server/config";
import { get } from "lodash";

let notifyClient: NotifyClient | undefined;

export function getNotifyClient() {
  if (config.isSmokeTest) {
    return new FakeNotifyClient();
  }

  if (notifyClient === undefined) {
    const requiredTemplateIds = ["NOTIFY.apiKey"];
    requiredTemplateIds.forEach(throwIfConfigVarIsUndefined);

    notifyClient = new NotifyClient(config.NOTIFY.apiKey);
  }

  return notifyClient;
}

class FakeNotifyClient {
  sendEmail() {
    return { id: "Created" };
  }
}

export function throwIfConfigVarIsUndefined(varName: string): void {
  if (!get(config, varName)) {
    throw new Error(`Server config variable ${varName} is missing`);
  }
}
