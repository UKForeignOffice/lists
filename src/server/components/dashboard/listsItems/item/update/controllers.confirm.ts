import { NextFunction, Request, Response } from "express";
import { logger } from "server/services/logger";
import { DEFAULT_VIEW_PROPS } from "server/components/dashboard/controllers/controllers";
import { getCSRFToken } from "server/components/cookies/helpers";
import { Action } from "./types";
import { actionHandlers } from "./actionHandlers";
import { ListItemRes } from "../../types";
import { merge } from "lodash";

export async function get(req: Request, res: Response, _next: NextFunction) {
  const { listItemUrl, listItem } = res.locals;
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

  listItem.jsonData = merge(listItem.jsonData, listItem.jsonData.updatedJsonData ?? {});
  const actionsWithEmail: Action[] = ["publish", "remove", "requestChanges", "update", "updateLive", "updateNew"];

  return res.render(`dashboard/list-item-confirm/${view}`, {
    ...DEFAULT_VIEW_PROPS,
    message,
    action,
    listItem,
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
    logger.error(
      `listItem update: ${req.user!.id} attempted to perform an unrecognised action "${action}" on ${req.params.listId}`
    );
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
  editDetails: "editDetails",
  requestChanges: "requestChanges",
  unpin: "pin",
  unpublish: "unpublish",
  update: "update",
  updateLive: "update",
  updateNew: "publish",
  archive: "archive",
};

const actionToButtonText: Record<Action, string> = {
  publish: "Publish",
  pin: "Pin",
  remove: "Remove",
  editDetails: "Edit details",
  requestChanges: "Request changes",
  unpin: "Unpin",
  unpublish: "Unpublish",
  update: "Update",
  updateLive: "Update",
  updateNew: "Publish",
  archive: "Archive",
};
