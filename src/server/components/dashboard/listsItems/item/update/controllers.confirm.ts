import { NextFunction, Response } from "express";
import { logger } from "server/services/logger";
import { DEFAULT_VIEW_PROPS } from "server/components/dashboard/controllers";
import { getCSRFToken } from "server/components/cookies/helpers";
import { Action, ActionHandlersReq } from "./types";
import { actionHandlers } from "server/components/dashboard/listsItems/item/update/actionHandlers";
import { ListItemRes } from "../../types";

const confirmationPages: { [key: string]: string } = {
  publish: "dashboard/list-item-confirm-publish",
  updateNew: "dashboard/list-item-confirm-publish",
  unpublish: "dashboard/list-item-confirm-unpublish",
  requestChanges: "dashboard/list-item-confirm-changes",
  update: "dashboard/list-item-confirm-update",
  updateLive: "dashboard/list-item-confirm-update",
  pin: "dashboard/list-item-confirm-pin",
  unpin: "dashboard/list-item-confirm-pin",
  remove: "dashboard/list-item-confirm-remove",
};

const actionToConfirmationView: Record<Action, string> = {
  publish: "publish",
  pin: "pin",
  remove: "remove",
  requestChanges: "requestChanges",
  unpin: "pin",
  unpublish: "unpublish",
  update: "update",
  updateLive: "update",
  updateNew: "publish",
};

export async function get(req: ActionHandlersReq, res: Response) {
  const { list, listItem, listItemUrl } = res.locals;
  const { update = {} } = req.session;
  const { message, action } = update;

  if (!action) {
    req.flash("errorMsg", "You must select an action");
    return res.redirect(listItemUrl);
  }

  return res.render(`dashboard/list-item-confirm/${action}`, {
    ...DEFAULT_VIEW_PROPS,
    list,
    listItem,
    message,
    action,
    csrfToken: getCSRFToken(req),
  });
}

export function post(req: ActionHandlersReq, res: ListItemRes, next: NextFunction) {
  const { update = {} } = req.session;
  const { action } = update;

  if (!action || !actionHandlers[action]) {
    req.flash("errorMsg", "This action is not recognised");
    logger.error(`${req.user!.id} attempted to perform an unrecognised action "${action}" on ${req.params.listId}`);
    return res.redirect(res.locals.listItemUrl);
  }

  const handler = actionHandlers[action];
  logger.info(`user ${req.user!.id} is attempting to perform an an action: ${action} with handler ${handler.name}`);

  return handler(req, res, next);
}
