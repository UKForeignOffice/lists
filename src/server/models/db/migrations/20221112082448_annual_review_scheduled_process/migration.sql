-- AlterTable
ALTER TABLE "List" ADD COLUMN     "lastAnnualReviewStartDate" TIMESTAMP(3),
ADD COLUMN     "nextAnnualReviewStartDate" TIMESTAMP(3) NOT NULL DEFAULT NOW() + interval '1 year';
