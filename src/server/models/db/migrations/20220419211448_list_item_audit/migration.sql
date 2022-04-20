/*
  Warnings:

  - You are about to drop the `Event` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "AuditEvent" AS ENUM ('NEW', 'OUT_WITH_PROVIDER', 'EDITED', 'ANNUAL_REVIEW', 'REVIEWED', 'UNPUBLISHED', 'PUBLISHED', 'PINNED', 'UNPINNED', 'DELETED', 'UNDEFINED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Status" ADD VALUE 'OUT_WITH_PROVIDER';
ALTER TYPE "Status" ADD VALUE 'EDITED';
ALTER TYPE "Status" ADD VALUE 'ANNUAL_REVIEW';
ALTER TYPE "Status" ADD VALUE 'REVIEW_OVERDUE';
ALTER TYPE "Status" ADD VALUE 'REVIEWED';
ALTER TYPE "Status" ADD VALUE 'PUBLISHED';
ALTER TYPE "Status" ADD VALUE 'UNPUBLISHED';

-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_listItemId_fkey";

-- AlterTable
ALTER TABLE "Audit" ADD COLUMN     "auditEvent" "AuditEvent" NOT NULL DEFAULT E'UNDEFINED',
ADD COLUMN     "listItemId" INTEGER;

-- DropTable
DROP TABLE "Event";

-- DropEnum
DROP TYPE "ListItemEvent";

-- CreateIndex
CREATE INDEX "Audit.listItemId_index" ON "Audit"("listItemId");

-- AddForeignKey
ALTER TABLE "Audit" ADD FOREIGN KEY ("listItemId") REFERENCES "ListItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
