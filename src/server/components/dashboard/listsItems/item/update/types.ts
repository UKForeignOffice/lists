import { NextFunction, Request, RequestHandler } from "express";
import { ListItemRes } from "server/components/dashboard/listsItems/types";

export type Action =
  | "publish"
  | "updateNew"
  | "unpublish"
  | "requestChanges"
  | "updateLive"
  | "pin"
  | "unpin"
  | "update"
  | "remove";
