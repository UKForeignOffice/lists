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

interface ActionHandlersRequest extends Request {
  session: Request["session"] & {
    action: Action;
    message?: string;
  };
}

export type ActionRequestHandler = (req: ActionHandlersRequest, res: ListItemRes, next: NextFunction) => Promise<any>;
