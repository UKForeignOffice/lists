import { Action } from "../types";
import { update } from "./update";
import { pin } from "./pin";
import { remove } from "./remove";
import { publish } from "./publish";
import { requestChanges } from "./requestChanges";
import { RequestHandler } from "express";

export const actionHandlers: Record<Action, RequestHandler> = {
  update,
  updateNew: update,
  updateLive: update,
  pin,
  unpin: pin,
  // @ts-ignore
  requestChanges,
  remove,
  publish,
  unpublish: publish,
};
