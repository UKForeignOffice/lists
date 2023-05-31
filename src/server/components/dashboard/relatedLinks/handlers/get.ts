// import { Request } from "express";
// import { ListIndexRes } from "server/components/dashboard/listsItems/types";
// import { List } from "server/models/types";
// import { logger } from "server/services/logger";
// import { createKeyDatesFromISODate } from "server/components/dashboard/annualReview/helpers.keyDates";
// import { differenceInWeeks, parseISO, startOfDay, startOfToday } from "date-fns";
//
// export async function get(req: Request, res: ListIndexRes) {
//   if (!req.user?.isAdministrator) {
//     req.flash("error", "You do not have the correct permissions to view this page");
//     return res.redirect(res.locals.listsEditUrl);
//   }
//
//   if (req.query.del) {
//     // @ts-ignore
//     const toDelete = req.query.del.split(",").map(Number);
//     await deleteEvents(toDelete);
//     // eslint-disable-next-line @typescript-eslint/no-base-to-string
//     req.flash("successBannerMessage", `Reminders ${req.query.del} deleted. They will be reattempted on the next run`);
//     req.flash("successBannerHeading", "Key dates update");
//     return res.redirect("development");
//   }
//
//   const { list } = res.locals;
//
//   if (!list) {
//     return res.redirect(res.locals.listsEditUrl);
//   }
//
//   const jsonData = list.jsonData as List["jsonData"];
//
//   const { nextAnnualReviewStartDate } = list;
//
//   if (!nextAnnualReviewStartDate) {
//     req.flash("error", "Set an annual review date first");
//     return res.redirect(res.locals.listsEditUrl);
//   }
//
//   if (!jsonData.currentAnnualReview?.keyDates) {
//     logger.warn(`${list.id} is missing the keyDates object`);
//   }
//
//   const keyDates = jsonData.currentAnnualReview?.keyDates ?? createKeyDatesFromISODate(nextAnnualReviewStartDate);
//   const weeklyReminders = await findReminders(list.id);
//   const start = startOfDay(parseISO(keyDates.annualReview.START));
//
//   return res.render("dashboard/lists-edit-dev", {
//     keyDates: flattenKeyDatesObject(keyDates),
//     csrfToken: req.csrfToken(),
//     weeklyReminders,
//     currentWeek: differenceInWeeks(startOfToday(), start),
//   });
// }
