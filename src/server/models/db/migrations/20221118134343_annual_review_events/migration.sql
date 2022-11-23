-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ListItemEvent" ADD VALUE 'ANNUAL_REVIEW_START_ONE_MONTH_REMINDER_EMAIL';
ALTER TYPE "ListItemEvent" ADD VALUE 'ANNUAL_REVIEW_START_ONE_WEEK_REMINDER_EMAIL';
ALTER TYPE "ListItemEvent" ADD VALUE 'ANNUAL_REVIEW_START_ONE_DAY_REMINDER_EMAIL';
ALTER TYPE "ListItemEvent" ADD VALUE 'WEEKLY_UNPUBLISH_POST_REMINDER_EMAIL';
ALTER TYPE "ListItemEvent" ADD VALUE 'ONE_DAY_UNPUBLISH_POST_REMINDER_EMAIL';
ALTER TYPE "ListItemEvent" ADD VALUE 'WEEKLY_UNPUBLISH_PROVIDER_REMINDER_EMAIL';
ALTER TYPE "ListItemEvent" ADD VALUE 'ONE_DAY_UNPUBLISH_PROVIDER_REMINDER_EMAIL';

-- AlterTable
ALTER TABLE "List" ALTER COLUMN "nextAnnualReviewStartDate" SET DEFAULT NOW() + interval '1 year';
