-- CreateEnum
CREATE TYPE "AnnualReviewPostEmailType" AS ENUM (
  'sendOneMonthPostEmail',
  'sendOneWeekPostEmail',
  'sendOneDayPostEmail',
  'sendStartedPostEmail',
  'sendUnpublishOneDayPostEmail',
  'sendUnpublishWeeklyPostEmail'
);

-- CreateEnum
CREATE TYPE "AnnualReviewProviderEmailType" AS ENUM (
  'sendStartedProviderEmail',
  'sendUnpublishedProviderEmail',
  'sendUnpublishOneDayProviderEmail',
  'sendUnpublishWeeklyProviderEmail'
);

-- Alter Audit and Event Tables
ALTER TABLE "Audit" ADD COLUMN "annualReviewEmailType" "AnnualReviewPostEmailType";
ALTER TABLE "Event" ADD COLUMN "annualReviewEmailType" "AnnualReviewProviderEmailType";

-- Update emailType in Audit and Event Tables
UPDATE "Audit" AS a
SET "annualReviewEmailType" = CASE
    WHEN a."jsonData" ->> 'reminderType' = 'sendOneMonthPostEmail' THEN 'sendOneMonthPostEmail'::"AnnualReviewPostEmailType"
    WHEN a."jsonData" ->> 'reminderType' = 'sendOneWeekPostEmail' THEN 'sendOneWeekPostEmail'::"AnnualReviewPostEmailType"
    WHEN a."jsonData" ->> 'reminderType' = 'sendOneDayPostEmail' THEN 'sendOneDayPostEmail'::"AnnualReviewPostEmailType"
    WHEN a."jsonData" ->> 'reminderType' = 'sendStartedPostEmail' THEN 'sendStartedPostEmail'::"AnnualReviewPostEmailType"
    WHEN a."jsonData" ->> 'reminderType' = 'sendUnpublishOneDayPostEmail' THEN 'sendUnpublishOneDayPostEmail'::"AnnualReviewPostEmailType"
    WHEN a."jsonData" ->> 'reminderType' = 'sendUnpublishWeeklyPostEmail' THEN 'sendUnpublishWeeklyPostEmail'::"AnnualReviewPostEmailType"
    ELSE NULL
  END;


-- Adding 'sendStartedProviderEmail' audits from audit table to event table.
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
          when "jsonData"->>'reminderType' = 'sendStartedProviderEmail' then 'sendStartedProviderEmail'::"AnnualReviewProviderEmailType"
          else null
          end
from audit_reminders;



-- Reading Event.jsonData.notes and adding AnnualReviewProviderEmailType.
UPDATE "Event" AS e
SET "annualReviewEmailType" = CASE
  WHEN EXISTS (SELECT 1 FROM jsonb_array_elements_text(e."jsonData"->'notes') AS note WHERE note ILIKE 'sent reminder for week%') THEN 'sendUnpublishWeeklyProviderEmail'::"AnnualReviewProviderEmailType"
  WHEN EXISTS (SELECT 1 FROM jsonb_array_elements_text(e."jsonData"->'notes') AS note WHERE note ILIKE 'sent reminder for 1 days%') THEN 'sendUnpublishOneDayProviderEmail'::"AnnualReviewProviderEmailType"
  WHEN EXISTS (SELECT 1 FROM jsonb_array_elements_text(e."jsonData"->'notes') AS note WHERE note ILIKE 'sent reminder for 0 days%') THEN 'sendUnpublishedProviderEmail'::"AnnualReviewProviderEmailType"
  ELSE NULL
  END
where type = 'REMINDER';


