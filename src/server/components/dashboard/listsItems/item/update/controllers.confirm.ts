import { NextFunction, Request, Response } from "express";
import { logger } from "server/services/logger";
import { DEFAULT_VIEW_PROPS } from "server/components/dashboard/controllers";
import { getCSRFToken } from "server/components/cookies/helpers";
import { Action } from "./types";
import { actionHandlers } from "./actionHandlers";
import { ListItemRes } from "../../types";

export async function get(req: Request, res: Response, _next: NextFunction) {
  const { listItemUrl } = res.locals;
  const { update = {} } = req.session;
  const { message, action } = update;

  if (!action) {
    req.flash("errorMsg", "You must select an action");
    return res.redirect(listItemUrl);
  }

  const view = actionToConfirmationView[action];

  if (!view) {
    req.flash("errorMsg", "This action is not recognised");
    return res.redirect(listItemUrl);
  }

  const actionsWithEmail: Action[] = ["publish", "remove", "requestChanges", "update", "updateLive", "updateNew"];

  return res.render(`dashboard/list-item-confirm/${view}`, {
    ...DEFAULT_VIEW_PROPS,
    message,
    action,
    willEmail: actionsWithEmail.includes(action),
    buttonText: actionToButtonText[action],
    csrfToken: getCSRFToken(req),
  });
}

export function post(req: Request, res: ListItemRes, next: NextFunction) {
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

const actionToButtonText: Record<Action, string> = {
  publish: "Publish",
  pin: "Pin",
  remove: "Remove",
  requestChanges: "Request changes",
  unpin: "Unpin",
  unpublish: "Unpublish",
  update: "Update",
  updateLive: "Update",
  updateNew: "Publish",
};
