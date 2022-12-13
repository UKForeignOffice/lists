/*
  Warnings:

  - The values [ANNUAL_REVIEW_START_ONE_DAY_REMINDER_POST_EMAIL_SENT,ANNUAL_REVIEW_START_ONE_WEEK_REMINDER_POST_EMAIL_SENT,ANNUAL_REVIEW_START_ONE_MONTH_REMINDER_POST_EMAIL_SENT,ANNUAL_REVIEW_STARTED_POST_EMAIL_SENT,ANNUAL_REVIEW_STARTED_PROVIDER_EMAIL_SENT,UNPUBLISHED_POST_EMAIL_SENT,UNPUBLISH_ONE_DAY_REMINDER_POST_EMAIL_SENT,UNPUBLISH_WEEKLY_REMINDER_POST_EMAIL_SENT,UNPUBLISHED_PROVIDER_EMAIL_SENT,UNPUBLISH_ONE_DAY_REMINDER_PROVIDER_EMAIL_SENT,UNPUBLISH_WEEKLY_REMINDER_PROVIDER_EMAIL_SENT] on the enum `AuditEvent` will be removed. If these variants are still used in the database, this will fail.
  - The values [UNPUBLISH_ONE_DAY_REMINDER_PROVIDER_EMAIL_SENT,UNPUBLISH_WEEKLY_REMINDER_PROVIDER_EMAIL_SENT] on the enum `ListItemEvent` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AuditEvent_new" AS ENUM ('NEW', 'OUT_WITH_PROVIDER', 'EDITED', 'ANNUAL_REVIEW', 'REVIEWED', 'UNPUBLISHED', 'PUBLISHED', 'PINNED', 'UNPINNED', 'DELETED', 'REMINDER', 'UNDEFINED');
ALTER TABLE "Audit" ALTER COLUMN "auditEvent" DROP DEFAULT;
ALTER TABLE "Audit" ALTER COLUMN "auditEvent" TYPE "AuditEvent_new" USING ("auditEvent"::text::"AuditEvent_new");
ALTER TYPE "AuditEvent" RENAME TO "AuditEvent_old";
ALTER TYPE "AuditEvent_new" RENAME TO "AuditEvent";
DROP TYPE "AuditEvent_old";
ALTER TABLE "Audit" ALTER COLUMN "auditEvent" SET DEFAULT 'UNDEFINED';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "ListItemEvent_new" AS ENUM ('NEW', 'OUT_WITH_PROVIDER', 'EDITED', 'UNPUBLISHED', 'PUBLISHED', 'PINNED', 'UNPINNED', 'DELETED', 'UNDEFINED', 'ANNUAL_REVIEW_STARTED', 'CHECK_ANNUAL_REVIEW', 'ARCHIVED', 'REMINDER');
ALTER TABLE "Event" ALTER COLUMN "type" TYPE "ListItemEvent_new" USING ("type"::text::"ListItemEvent_new");
ALTER TYPE "ListItemEvent" RENAME TO "ListItemEvent_old";
ALTER TYPE "ListItemEvent_new" RENAME TO "ListItemEvent";
DROP TYPE "ListItemEvent_old";
COMMIT;

-- AlterTable
ALTER TABLE "List" ADD COLUMN     "isAnnualReview" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "nextAnnualReviewStartDate" SET DEFAULT NOW() + interval '1 year';

-- RenameIndex
ALTER INDEX "Audit.jsonData_index" RENAME TO "Audit_jsonData_idx";

-- RenameIndex
ALTER INDEX "Audit.type_index" RENAME TO "Audit_type_idx";

-- RenameIndex
ALTER INDEX "Country.name_unique" RENAME TO "Country_name_key";

-- RenameIndex
ALTER INDEX "Feedback.type_index" RENAME TO "Feedback_type_idx";

-- RenameIndex
ALTER INDEX "GeoLocation.location_index" RENAME TO "GeoLocation_location_idx";

-- RenameIndex
ALTER INDEX "List.reference_unique" RENAME TO "List_reference_key";

-- RenameIndex
ALTER INDEX "List.type_countryId_index" RENAME TO "List_type_countryId_idx";

-- RenameIndex
ALTER INDEX "ListItem.reference_unique" RENAME TO "ListItem_reference_key";

-- RenameIndex
ALTER INDEX "ListItem.type_reference_isApproved_isPublished_isBlocked_index" RENAME TO "ListItem_type_reference_isApproved_isPublished_isBlocked_idx";

-- RenameIndex
ALTER INDEX "User.email_unique" RENAME TO "User_email_key";
