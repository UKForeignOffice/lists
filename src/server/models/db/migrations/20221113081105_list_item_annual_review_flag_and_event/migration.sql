-- AlterEnum
ALTER TYPE "ListItemEvent" ADD VALUE 'ANNUAL_REVIEW_STARTED';

-- AlterTable
ALTER TABLE "List" ALTER COLUMN "nextAnnualReviewStartDate" SET DEFAULT NOW() + interval '1 year';

-- AlterTable
ALTER TABLE "ListItem" ADD COLUMN     "isAnnualReview" BOOLEAN NOT NULL DEFAULT false;
