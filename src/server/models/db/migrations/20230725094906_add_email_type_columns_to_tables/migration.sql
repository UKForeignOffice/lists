-- CreateEnum
CREATE TYPE "PostEmailType" AS ENUM (
  'sendOneMonthPostEmail',
  'sendOneWeekPostEmail',
  'sendOneDayPostEmail',
  'sendStartedPostEmail',
  'sendUnpublishOneDayPostEmail',
  'sendUnpublishWeeklyPostEmail'
);

-- CreateEnum
CREATE TYPE "ProviderEmailType" AS ENUM (
  'sendStartedProviderEmail',
  'sendUnpublishedProviderEmail',
  'sendUnpublishOneDayProviderEmail',
  'sendUnpublishWeeklyProviderEmail'
);

-- Alter Audit and Event Tables
ALTER TABLE "Audit" ADD COLUMN "emailType" "PostEmailType";
ALTER TABLE "Event" ADD COLUMN "emailType" "ProviderEmailType";

-- Update emailType in Audit and Event Tables
UPDATE "Audit" AS a
SET "emailType" = CASE
    WHEN a."jsonData" ->> 'reminderType' = 'sendOneMonthPostEmail' THEN 'sendOneMonthPostEmail'::"PostEmailType"
    WHEN a."jsonData" ->> 'reminderType' = 'sendOneWeekPostEmail' THEN 'sendOneWeekPostEmail'::"PostEmailType"
    WHEN a."jsonData" ->> 'reminderType' = 'sendOneDayPostEmail' THEN 'sendOneDayPostEmail'::"PostEmailType"
    WHEN a."jsonData" ->> 'reminderType' = 'sendStartedPostEmail' THEN 'sendStartedPostEmail'::"PostEmailType"
    WHEN a."jsonData" ->> 'reminderType' = 'sendUnpublishOneDayPostEmail' THEN 'sendUnpublishOneDayPostEmail'::"PostEmailType"
    WHEN a."jsonData" ->> 'reminderType' = 'sendUnpublishWeeklyPostEmail' THEN 'sendUnpublishWeeklyPostEmail'::"PostEmailType"
    ELSE NULL
  END;


-- Adding 'sendStartedProviderEmail' audits from audit table to event table.
with audit_reminders as (select * from "Audit" where "auditEvent" = 'REMINDER' and "emailType" is null)

insert into "Event" ("listItemId", time, type, "jsonData", "emailType")
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
          when "jsonData"->>'reminderType' = 'sendStartedProviderEmail' then 'sendStartedProviderEmail'::"ProviderEmailType"
          else null
          end
from audit_reminders;



-- Reading Event.jsonData.notes and adding providerEmailType.
UPDATE "Event" AS e
SET "emailType" = CASE
  WHEN EXISTS (SELECT 1 FROM jsonb_array_elements_text(e."jsonData"->'notes') AS note WHERE note ILIKE 'sent reminder for week%') THEN 'sendUnpublishWeeklyProviderEmail'::"ProviderEmailType"
  WHEN EXISTS (SELECT 1 FROM jsonb_array_elements_text(e."jsonData"->'notes') AS note WHERE note ILIKE 'sent reminder for 1 days%') THEN 'sendUnpublishOneDayProviderEmail'::"ProviderEmailType"
  WHEN EXISTS (SELECT 1 FROM jsonb_array_elements_text(e."jsonData"->'notes') AS note WHERE note ILIKE 'sent reminder for 0 days%') THEN 'sendUnpublishedProviderEmail'::"ProviderEmailType"
  ELSE NULL
  END
where type = 'REMINDER';


