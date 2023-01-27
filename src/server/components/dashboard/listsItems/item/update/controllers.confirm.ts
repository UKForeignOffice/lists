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

const actionToHeading: Record<Action, string> = {};

export async function get(req: Request, res: Response): Promise<void> {
  const { list, listItem, listItemUrl } = res.locals;
  const { update = {} } = req.session;
  const { message, action } = update;
  try {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions

    if (!action) {
      req.flash("errorMsg", "You must select an action");
      return res.redirect(listItemUrl);
    }

    if (action === "requestChanges") {
      if (!message) {
        req.flash("errorMsg", "You must provide a message to request a change");
        return res.redirect(listItemUrl);
      }

      req.session.changeMessage = message;
    }

    res.render(`dashboard/list-item-confirm/${action}`, {
      ...DEFAULT_VIEW_PROPS,
      list,
      listItem,
      message,
      action,
      csrfToken: getCSRFToken(req),
    });
  } catch (error) {
    logger.error(`listItemPostController Error: ${(error as Error).message}`);
  }
}

export function post() {}
