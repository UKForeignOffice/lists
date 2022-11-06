/*
  Warnings:

  - The values [ANNUAL_REVIEW,REVIEWED] on the enum `ListItemEvent` will be removed. If these variants are still used in the database, this will fail.
  - The values [ANNUAL_REVIEW,REVIEW_OVERDUE,REVIEWED] on the enum `Status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ListItemEvent_new" AS ENUM ('NEW', 'OUT_WITH_PROVIDER', 'EDITED', 'UNPUBLISHED', 'PUBLISHED', 'PINNED', 'UNPINNED', 'DELETED', 'UNDEFINED', 'ANNUAL_REVIEW_STARTED', 'CHECK_ANNUAL_REVIEW');
ALTER TABLE "Event" ALTER COLUMN "type" TYPE "ListItemEvent_new" USING ("type"::text::"ListItemEvent_new");
ALTER TYPE "ListItemEvent" RENAME TO "ListItemEvent_old";
ALTER TYPE "ListItemEvent_new" RENAME TO "ListItemEvent";
DROP TYPE "ListItemEvent_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "Status_new" AS ENUM ('NEW', 'OUT_WITH_PROVIDER', 'EDITED', 'PUBLISHED', 'UNPUBLISHED', 'CHECK_ANNUAL_REVIEW', 'ANNUAL_REVIEW_OVERDUE');
ALTER TABLE "ListItem" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "ListItem" ALTER COLUMN "status" TYPE "Status_new" USING ("status"::text::"Status_new");
ALTER TYPE "Status" RENAME TO "Status_old";
ALTER TYPE "Status_new" RENAME TO "Status";
DROP TYPE "Status_old";
ALTER TABLE "ListItem" ALTER COLUMN "status" SET DEFAULT 'NEW';
COMMIT;

-- DropForeignKey
ALTER TABLE "Address" DROP CONSTRAINT "Address_countryId_fkey";

-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_listItemId_fkey";

-- DropForeignKey
ALTER TABLE "List" DROP CONSTRAINT "List_countryId_fkey";

-- DropForeignKey
ALTER TABLE "ListItem" DROP CONSTRAINT "ListItem_addressId_fkey";

-- DropForeignKey
ALTER TABLE "ListItem" DROP CONSTRAINT "ListItem_listId_fkey";

-- AlterTable
ALTER TABLE "Event" ALTER COLUMN "time" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "ListItem" ADD COLUMN     "isAnnualReview" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "List" ADD FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListItem" ADD FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListItem" ADD FOREIGN KEY ("listId") REFERENCES "List"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD FOREIGN KEY ("listItemId") REFERENCES "ListItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
