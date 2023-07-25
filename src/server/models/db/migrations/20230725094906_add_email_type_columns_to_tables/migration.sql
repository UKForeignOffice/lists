BEGIN;

-- CreateEnum
CREATE TYPE "PostEmailType" AS ENUM (
  'sendOneMonthPostEmail',
  'sendOneWeekPostEmail',
  'sendOneDayPostEmail',
  'sendStartedPostEmail',
  'sendUnpublishOneDayPostEmail',
  'sendUnpublishWeeklyPostEmail',
  'undefined'
);

-- CreateEnum
CREATE TYPE "ProviderEmailType" AS ENUM (
  'sendStartedProviderEmail',
  'sendUnpublishedProviderEmail',
  'sendUnpublishOneDayProviderEmail',
  'sendUnpublishWeeklyProviderEmail',
  'undefined'
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
    ELSE 'undefined'::"PostEmailType"
  END;

UPDATE "Event" AS e
SET "emailType" = CASE
  WHEN 'sendStartedProviderEmail' = ANY (SELECT jsonb_array_elements_text(e."jsonData"->'notes')) THEN 'sendStartedProviderEmail'::"ProviderEmailType"
  WHEN EXISTS (SELECT 1 FROM jsonb_array_elements_text(e."jsonData"->'notes') AS note WHERE note ILIKE 'sent reminder for week%') THEN 'sendUnpublishWeeklyProviderEmail'::"ProviderEmailType"
  WHEN EXISTS (SELECT 1 FROM jsonb_array_elements_text(e."jsonData"->'notes') AS note WHERE note ILIKE 'sent reminder for 1 days%') THEN 'sendUnpublishOneDayProviderEmail'::"ProviderEmailType"
  WHEN EXISTS (SELECT 1 FROM jsonb_array_elements_text(e."jsonData"->'notes') AS note WHERE note ILIKE 'sent reminder for 0 days%') THEN 'sendUnpublishedProviderEmail'::"ProviderEmailType"
  ELSE 'undefined'::"ProviderEmailType"
END;

COMMIT;
