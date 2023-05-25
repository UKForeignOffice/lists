import { ListIndexRes } from "server/components/dashboard/listsItems/types";
import { List, ListJsonData, ScheduledProcessKeyDates } from "server/models/types";
import { differenceInWeeks, eachWeekOfInterval, parseISO, startOfDay, startOfToday } from "date-fns";

import { prisma } from "server/models/db/prisma-client";
import { Request } from "express";
import { logger } from "server/services/logger";
import { createKeyDatesFromISODate } from "server/components/dashboard/annualReview/helpers.keyDates";
import { URLSearchParams } from "url";

export async function get(req: Request, res: ListIndexRes) {
  if (!req.user?.isAdministrator) {
    req.flash("error", "You do not have the correct permissions to view this page");
    return res.redirect(res.locals.listsEditUrl);
  }

  if (req.query.del) {
    // @ts-ignore
    const toDelete = req.query.del.split(",").map(Number);
    await deleteEvents(toDelete);
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    req.flash("successBannerMessage", `Reminders ${req.query.del} deleted. They will be reattempted on the next run`);
    req.flash("successBannerHeading", "Key dates update");
    return res.redirect("development");
  }

  const { list } = res.locals;

  if (!list) {
    return res.redirect(res.locals.listsEditUrl);
  }

  const jsonData = list.jsonData as List["jsonData"];

  const { nextAnnualReviewStartDate } = list;

  if (!nextAnnualReviewStartDate) {
    req.flash("error", "Set an annual review date first");
    return res.redirect(res.locals.listsEditUrl);
  }

  if (!jsonData.currentAnnualReview?.keyDates) {
    logger.warn(`${list.id} is missing the keyDates object`);
  }

  const keyDates = jsonData.currentAnnualReview?.keyDates ?? createKeyDatesFromISODate(nextAnnualReviewStartDate);
  const weeklyReminders = await findReminders(list.id);
  const start = startOfDay(parseISO(keyDates.annualReview.START));

  return res.render("dashboard/lists-edit-dev", {
    keyDates: flattenKeyDatesObject(keyDates),
    csrfToken: req.csrfToken(),
    weeklyReminders,
    currentWeek: differenceInWeeks(startOfToday(), start),
  });
}

function formatISOString(dateString: string) {
  return parseISO(dateString).toISOString();
}

function parseKeyDatesFromBodyRequest(keyDates: ScheduledProcessKeyDates) {
  const { annualReview, unpublished } = keyDates;
  return {
    annualReview: {
      POST_ONE_MONTH: formatISOString(annualReview.POST_ONE_MONTH),
      POST_ONE_WEEK: formatISOString(annualReview.POST_ONE_WEEK),
      POST_ONE_DAY: formatISOString(annualReview.POST_ONE_DAY),
      START: formatISOString(annualReview.START),
    },
    unpublished: {
      ONE_WEEK: formatISOString(unpublished.ONE_WEEK),
      ONE_DAY: formatISOString(unpublished.ONE_DAY),
      UNPUBLISH: formatISOString(unpublished.UNPUBLISH),
    },
  };
}

function flattenKeyDatesObject(keyDates: ScheduledProcessKeyDates) {
  return {
    "annualReview[POST_ONE_MONTH]": keyDates.annualReview.POST_ONE_MONTH,
    "annualReview[POST_ONE_WEEK]": keyDates.annualReview.POST_ONE_WEEK,
    "annualReview[POST_ONE_DAY]": keyDates.annualReview.POST_ONE_DAY,
    "annualReview[START]": keyDates.annualReview.START,
    "unpublished[ONE_WEEK]": keyDates.unpublished.ONE_WEEK,
    "unpublished[ONE_DAY]": keyDates.unpublished.ONE_DAY,
    "unpublished[UNPUBLISH]": keyDates.unpublished.UNPUBLISH,
  };
}

export async function post(req: Request, res: ListIndexRes) {
  if (!req.user?.isAdministrator) {
    req.flash("You do not have the correct permissions to edit key dates");
    return res.redirect(res.locals.listsEditUrl);
  }

  const { list } = res.locals;

  if (!list) {
    req.flash("error", "There was a problem");
    return res.redirect(res.locals.listsEditUrl);
  }

  const jsonData = list.jsonData as List["jsonData"];
  const { currentAnnualReview } = jsonData;

  let newDates;

  try {
    newDates = parseKeyDatesFromBodyRequest(req.body);
  } catch (e) {
    logger.error(e);
    req.flash("error", "The date must be a valid ISO Date string for example 2019-09-18 (YYYY-MM-DD)");
    return res.redirect(`${res.locals.listsEditUrl}/development`);
  }

  const updatedCurrentAnnualReview = {
    ...currentAnnualReview,
    keyDates: {
      ...currentAnnualReview?.keyDates,
      ...newDates,
    },
  };

  const result = await prisma.list.update({
    where: {
      id: list.id,
    },
    data: {
      jsonData: {
        ...jsonData,
        currentAnnualReview: updatedCurrentAnnualReview,
      },
    },
  });

  if (!result) {
    req.flash("error", "Update failed");
    return res.redirect(`${res.locals.listsEditUrl}/development`);
  } //

  req.flash("successBannerMessage", "Key dates update was successful");
  req.flash("successBannerHeading", "Key dates update");

  return res.redirect(`${res.locals.listsEditUrl}/development`);
}

async function findReminders(listId: number) {
  const list = await prisma.list.findUnique({
    where: {
      id: listId,
    },
  });
  if (!list) {
    return;
  }

  const jsonData = list.jsonData as ListJsonData;
  const { currentAnnualReview } = jsonData;
  const { keyDates } = currentAnnualReview!;

  const start = startOfDay(parseISO(keyDates.annualReview.START));
  const end = startOfDay(parseISO(keyDates.unpublished.UNPUBLISH));
  const weekStartsOn = start.getDay();

  const weeks = eachWeekOfInterval(
    {
      start,
      end,
    },
    {
      // @ts-ignore
      weekStartsOn,
    }
  );

  const weeksWithQueryInput = weeks.map((weekStartDate, index) => {
    const greaterThanStartOfWeek = { gte: weekStartDate };
    const lessThanStartOfNextWeek = { lt: weeks[index + 1] ?? new Date() };
    return {
      weeksSinceStart: differenceInWeeks(weekStartDate, start, { roundingMethod: "floor" }),
      eventInput: {
        ...greaterThanStartOfWeek,
        ...lessThanStartOfNextWeek,
      },
    };
  });

  const weeksWithEvents = await Promise.all(
    weeksWithQueryInput.map(async ({ weeksSinceStart, eventInput }) => {
      const events = await prisma.event.findMany({
        where: {
          listItem: {
            listId: list.id,
            isAnnualReview: true,
          },
          type: "REMINDER",
          time: eventInput,
        },
        include: {
          listItem: true,
        },
      });

      const eventIds = events.map((event) => `${event.id}`);
      const deleteUrl = new URLSearchParams({ del: eventIds });

      return {
        weeksSinceStart,
        eventInput,
        events,
        deleteUrl,
      };
    })
  );

  return weeksWithEvents.reduce((prev, curr) => {
    return {
      ...prev,
      [curr.weeksSinceStart]: {
        events: curr.events,
        deleteUrl: curr.deleteUrl,
        range: `${curr.eventInput.gte.toISOString().substring(0, 10)} - ${curr.eventInput.lt
          .toISOString()
          .substring(0, 10)}`,
      },
    };
  }, {});
}

async function deleteEvents(ids: number[]) {
  return await prisma.event.deleteMany({
    where: {
      id: {
        in: ids,
      },
    },
  });
}
