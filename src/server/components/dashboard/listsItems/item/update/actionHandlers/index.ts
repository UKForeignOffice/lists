import type { Action } from "../types";
import type { RequestHandler } from "express";
import { update } from "./update";
import { pin } from "./pin";
import { remove } from "./remove";
import { publish } from "./publish";
import { archive } from "./archive";
import { requestChanges } from "./requestChanges";
import { editDetails } from "./editDetails";

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
  archive,
  unpublish: publish,
  editDetails: editDetails,
};
