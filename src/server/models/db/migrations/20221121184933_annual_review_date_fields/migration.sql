-- AlterTable
ALTER TABLE "List" ALTER COLUMN "lastAnnualReviewStartDate" SET DATA TYPE DATE,
ALTER COLUMN "nextAnnualReviewStartDate" SET DEFAULT NOW() + interval '1 year',
ALTER COLUMN "nextAnnualReviewStartDate" SET DATA TYPE DATE;
