-- CreateEnum
CREATE TYPE "AnnualReviewPostEmailType" AS ENUM (
  'oneMonthBeforeStart',
  'oneWeekBeforeStart',
  'oneDayBeforeStart',
  'started',
  'oneDayBeforeUnpublish'
);

-- CreateEnum
CREATE TYPE "AnnualReviewProviderEmailType" AS ENUM (
  'started',
  'weeklyUnpublish',
  'oneDayBeforeUnpublish',
  'unpublished'
);

-- Alter Audit and Event Tables
ALTER TABLE "Audit" ADD COLUMN "annualReviewEmailType" "AnnualReviewPostEmailType";
ALTER TABLE "Event" ADD COLUMN "annualReviewEmailType" "AnnualReviewProviderEmailType";

-- Update emailType in Audit and Event Tables
UPDATE "Audit" AS a
SET "annualReviewEmailType" = CASE
    WHEN a."jsonData" ->> 'reminderType' = 'sendOneMonthPostEmail' THEN 'oneMonthBeforeStart'::"AnnualReviewPostEmailType"
    WHEN a."jsonData" ->> 'reminderType' = 'sendOneWeekPostEmail' THEN 'oneWeekBeforeStart'::"AnnualReviewPostEmailType"
    WHEN a."jsonData" ->> 'reminderType' = 'sendOneDayPostEmail' THEN 'oneDayBeforeStart'::"AnnualReviewPostEmailType"
    WHEN a."jsonData" ->> 'reminderType' = 'sendStartedPostEmail' THEN 'started'::"AnnualReviewPostEmailType"
    WHEN a."jsonData" ->> 'reminderType' = 'sendUnpublishOneDayPostEmail' THEN 'oneDayBeforeUnpublish'::"AnnualReviewPostEmailType"
    ELSE NULL
  END
where "jsonData"->>'reminderType' is not null;


-- copying over the `sendStartedProviderEmail` audit to the Event table.
with audit_reminders as (select * from "Audit" where "auditEvent" = 'REMINDER' and "annualReviewEmailType" is null and type = 'listItem')

insert into "Event" ("listItemId", time, type, "jsonData", "annualReviewEmailType")
select  cast("jsonData"->>'itemId' as int) "itemId",
        "createdAt",
        'REMINDER',
        jsonb_build_object(
          'itemId', "jsonData"->'itemId',
          'reference', "jsonData"->'annualReviewRef',
          'annualReviewRef', "jsonData"->'annualReviewRef',
          'eventName', "jsonData"->'eventName',
          'reminderType', "jsonData"->'reminderType'
          ),
        case
          when "jsonData"->>'reminderType' = 'sendStartedProviderEmail' then 'started'::"AnnualReviewProviderEmailType"
          else null
          end
from audit_reminders;



-- Reading Event.jsonData.notes and adding AnnualReviewProviderEmailType.
UPDATE "Event" AS e
SET "annualReviewEmailType" = CASE
  WHEN EXISTS (SELECT 1 FROM jsonb_array_elements_text(e."jsonData"->'notes') AS note WHERE note ILIKE 'sent reminder for week%') THEN 'weeklyUnpublish'::"AnnualReviewProviderEmailType"
  WHEN EXISTS (SELECT 1 FROM jsonb_array_elements_text(e."jsonData"->'notes') AS note WHERE note ILIKE 'sent reminder for 1 days%') THEN 'oneDayBeforeUnpublish'::"AnnualReviewProviderEmailType"
  WHEN EXISTS (SELECT 1 FROM jsonb_array_elements_text(e."jsonData"->'notes') AS note WHERE note ILIKE 'sent reminder for 0 days%') THEN 'unpublished'::"AnnualReviewProviderEmailType"
  ELSE NULL
  END
where type = 'REMINDER';


