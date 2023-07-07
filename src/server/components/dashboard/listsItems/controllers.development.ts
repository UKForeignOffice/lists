import type { ListIndexRes } from "server/components/dashboard/listsItems/types";
import type { List, ListJsonData, ScheduledProcessKeyDates } from "server/models/types";
import { differenceInWeeks, eachWeekOfInterval, formatISO, parseISO, startOfDay, startOfToday } from "date-fns";

import { prisma } from "server/models/db/prisma-client";
import type { Request } from "express";
import { logger } from "server/services/logger";
import { createKeyDatesFromISODate } from "server/components/dashboard/annualReview/helpers.keyDates";
import { URLSearchParams } from "url";

export async function get(req: Request, res: ListIndexRes) {
  if (!req.user?.isAdministrator) {
    req.flash("error", "You do not have the correct permissions to view this page");
    res.redirect(res.locals.listsEditUrl);
    return;
  }

  if (req.query.del) {
    // @ts-ignore
    const toDelete = req.query.del.split(",").map(Number);
    await deleteEvents(toDelete);
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    req.flash("successBannerMessage", `Reminders ${req.query.del} deleted. They will be reattempted on the next run`);
    req.flash("successBannerHeading", "Key dates update");
    res.redirect("development");
    return;
  }

  const { list } = res.locals;

  if (!list) {
    res.redirect(res.locals.listsEditUrl);
    return;
  }

  const jsonData = list.jsonData as List["jsonData"];

  const { nextAnnualReviewStartDate, lastAnnualReviewStartDate, isAnnualReview } = list;

  let annualReviewValuesToEdit = {};
  if (isAnnualReview) {
    const keyDates = jsonData.currentAnnualReview?.keyDates ?? createKeyDatesFromISODate(nextAnnualReviewStartDate!);
    const start = startOfDay(parseISO(keyDates.annualReview.START));

    annualReviewValuesToEdit = {
      keyDates: flattenKeyDatesObject(keyDates),
      weeklyReminders: await findReminders(list.id),
      currentWeek: differenceInWeeks(startOfToday(), start),
    };
  }

  res.render("dashboard/lists-edit-dev", {
    csrfToken: req.csrfToken(),
    nextAnnualReviewStartDate: nextAnnualReviewStartDate?.toISOString(),
    lastAnnualReviewStartDate: lastAnnualReviewStartDate?.toISOString(),
    ...annualReviewValuesToEdit,
    isAnnualReview,
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
    res.redirect(res.locals.listsEditUrl);
    return;
  }

  const { list } = res.locals;

  if (!list) {
    req.flash("error", "There was a problem");
    res.redirect(res.locals.listsEditUrl);
    return;
  }

  const { isAnnualReview } = list;

  if (isAnnualReview) {
    try {
      await setUpdatedCurrentAnnualReview(list, req.body);
      req.flash("successBannerMessage", "Key dates update was successful");
      req.flash("successBannerHeading", "Key dates update");

      res.redirect(`${res.locals.listsEditUrl}/development`);
    } catch (e) {
      logger.error(`listsItems post: ${e}`);
      req.flash("error", "The date must be a valid ISO Date string for example 2019-09-18 (YYYY-MM-DD)");
      res.redirect(`${res.locals.listsEditUrl}/development`);
    }

    return;
  }

  const { nextAnnualReviewStartDate, lastAnnualReviewStartDate } = req.body;
  try {
    await setNextOrLastDates(list.id, nextAnnualReviewStartDate, lastAnnualReviewStartDate);
    res.redirect(`${res.locals.listsEditUrl}/development`);
  } catch (e) {
    logger.error(`listsItems post: ${e}`);
    req.flash("error", e.message);
    res.redirect(`${res.locals.listsEditUrl}/development`);
  }
}

async function setUpdatedCurrentAnnualReview(list, body) {
  const jsonData = list.jsonData as List["jsonData"];
  const { currentAnnualReview } = jsonData;

  const newDates = parseKeyDatesFromBodyRequest(body);

  const updatedCurrentAnnualReview = {
    ...currentAnnualReview,
    keyDates: {
      ...currentAnnualReview?.keyDates,
      ...newDates,
    },
  };

  return await prisma.list.update({
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
}

async function setNextOrLastDates(id: number, nextAnnualReviewStartDate: string, lastAnnualReviewStartDate: string) {
  return await prisma.list.update({
    where: {
      id,
    },
    data: {
      nextAnnualReviewStartDate: formatISO(new Date(nextAnnualReviewStartDate)),
      ...(lastAnnualReviewStartDate && {
        lastAnnualReviewStartDate: formatISO(new Date(lastAnnualReviewStartDate)),
      }),
    },
  });
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
