-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ListItemEvent" ADD VALUE 'ANNUAL_REVIEW_START_ONE_DAY_REMINDER_EMAIL_SENT';
ALTER TYPE "ListItemEvent" ADD VALUE 'ANNUAL_REVIEW_START_ONE_WEEK_REMINDER_EMAIL_SENT';
ALTER TYPE "ListItemEvent" ADD VALUE 'ANNUAL_REVIEW_START_ONE_MONTH_REMINDER_EMAIL_SENT';
ALTER TYPE "ListItemEvent" ADD VALUE 'UNPUBLISH_ONE_DAY_POST_REMINDER_EMAIL_SENT';
ALTER TYPE "ListItemEvent" ADD VALUE 'UNPUBLISH_WEEKLY_POST_REMINDER_EMAIL_SENT';
ALTER TYPE "ListItemEvent" ADD VALUE 'UNPUBLISH_ONE_DAY_PROVIDER_REMINDER_EMAIL_SENT';
ALTER TYPE "ListItemEvent" ADD VALUE 'UNPUBLISH_WEEKLY_PROVIDER_REMINDER_EMAIL_SENT';

-- AlterTable
ALTER TABLE "List" ADD COLUMN     "lastAnnualReviewStartDate" DATE,
ADD COLUMN     "nextAnnualReviewStartDate" DATE NOT NULL DEFAULT NOW() + interval '1 year';
