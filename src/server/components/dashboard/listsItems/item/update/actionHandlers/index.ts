import { Action, ActionRequestHandler } from "../types";
import { update } from "./update";
import { pin } from "./pin";
import { del } from "./delete";
import { publish } from "./publish";
import { requestChanges } from "./requestChanges";
export const actionHandlers: Record<Action, ActionRequestHandler> = {
  update,
  pin,
  publish,
  requestChanges,
  remove,
};
