-- AlterTable
ALTER TABLE "List" ALTER COLUMN "nextAnnualReviewStartDate" SET DEFAULT NOW() + interval '1 year';
