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
    WHEN a."jsonData" ->> 'reminderType' = 'oneMonthBeforeStart' THEN 'oneMonthBeforeStart'::"AnnualReviewPostEmailType"
    WHEN a."jsonData" ->> 'reminderType' = 'oneWeekBeforeStart' THEN 'oneWeekBeforeStart'::"AnnualReviewPostEmailType"
    WHEN a."jsonData" ->> 'reminderType' = 'oneDayBeforeStart' THEN 'oneDayBeforeStart'::"AnnualReviewPostEmailType"
    WHEN a."jsonData" ->> 'reminderType' = 'started' THEN 'started'::"AnnualReviewPostEmailType"
    WHEN a."jsonData" ->> 'reminderType' = 'oneDayBeforeUnpublish' THEN 'oneDayBeforeUnpublish'::"AnnualReviewPostEmailType"
    WHEN a."jsonData" ->> 'reminderType' = 'sendUnpublishWeeklyPostEmail' THEN 'sendUnpublishWeeklyPostEmail'::"AnnualReviewPostEmailType"
    ELSE NULL
  END;


with audit_reminders as (select * from "Audit" where "auditEvent" = 'REMINDER' and "annualReviewEmailType" is null)

insert into "Event" ("listItemId", time, type, "jsonData", "annualReviewEmailType")
select  cast("jsonData"->>'itemId' as int) "itemId",
        "createdAt",
        'REMINDER',
        jsonb_build_object(
          'itemId', "jsonData"->'itemId',
          'reference', "jsonData"->'annualReviewRef',
          'eventName', "jsonData"->'eventName',
          'reminderType', "jsonData"->'reminderType',
          'reference', "jsonData"->'annualReviewRef'
          ),
        case
          when "jsonData"->>'reminderType' = 'started' then 'started'::"AnnualReviewProviderEmailType"
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


