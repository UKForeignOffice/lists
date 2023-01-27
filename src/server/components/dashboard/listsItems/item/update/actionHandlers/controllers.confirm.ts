import { Request, Response } from "express";
import { logger } from "server/services/logger";
import { DEFAULT_VIEW_PROPS } from "server/components/dashboard/controllers";
import { getCSRFToken } from "server/components/cookies/helpers";

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

type Action =
  | "publish"
  | "updateNew"
  | "unpublish"
  | "requestChanges"
  | "updateLive"
  | "pin"
  | "unpin"
  | "update"
  | "remove";

const actionToHandlers: Record<Action, string> = {
  publish: "",
  updateNew: "",
  unpublish: "",
  requestChanges: "",
  update: "",
  updateLive: "",
  pin: "",
  unpin: "",
  remove: "",
};

export async function get(req: Request, res: Response): Promise<void> {
  const { list, listItem, listItemUrl } = res.locals;
  const { update = {} } = req.session;
  const { message, action } = update;
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions

  if (!action) {
    req.flash("errorMsg", "You must select an action");
    return res.redirect(listItemUrl);
  }

  res.render(`dashboard/list-item-confirm/${action}`, {
    ...DEFAULT_VIEW_PROPS,
    list,
    listItem,
    message,
    action,
    csrfToken: getCSRFToken(req),
  });
}

export function post(req: Request, res: Response) {
  const { update = {} } = req.session;
  const { action } = update;
  logger.info(`user ${req.user!.id} is attempting to perform ${action}`);
  const handler = actionToHandlers[action];

  if (!handler) {
    req.flash("errorMsg", "This action is not recognised");
    logger.error(`${req.user!.id} attempted to perform an unrecognised action "${action}" on ${req.params.listId}`);
    return res.redirect(res.locals.listItemUrl);
  }

  return handler(req, res);

  //
}
