import { Action, ActionRequestHandler } from "../types";
import { update } from "./update";
import { pin } from "./pin";
import { remove } from "./remove";
import { publish } from "./publish";
import { requestChanges } from "./requestChanges";

export const actionHandlers: Record<Action, ActionRequestHandler> = {
  update,
  updateNew: update,
  updateLive: update,
  pin,
  unpin: pin,
  requestChanges,
  remove,
  publish,
  unpublish: publish,
};
