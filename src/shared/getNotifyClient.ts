import { NotifyClient } from "notifications-node-client";
import type { SendEmailResponse } from "notifications-node-client";
import * as config from "server/config";
import { get } from "lodash";

let notifyClient: NotifyClient | undefined;

type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

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
  sendEmail(): { statusText: string; data: DeepPartial<SendEmailResponse> } {
    return { statusText: "test", data: { id: "Created" } };
  }
}

export function throwIfConfigVarIsUndefined(varName: string): void {
  if (!get(config, varName)) {
    throw new Error(`Server config variable ${varName} is missing`);
  }
}
