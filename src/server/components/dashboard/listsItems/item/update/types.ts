import { NextFunction, Request } from "express";
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

export interface ActionHandlersReq extends Request {
  session: Request["session"] & {
    update?: {
      action?: Action;
      message?: string;
    };
  };
}

export type ActionRequestHandler = (req: ActionHandlersReq, res: ListItemRes, next: NextFunction) => Promise<any>;
