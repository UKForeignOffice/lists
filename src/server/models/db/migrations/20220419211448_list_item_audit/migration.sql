/*
  Warnings:

  - You are about to drop the `Event` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
DROP TYPE IF EXISTS "AuditEvent" CASCADE;
CREATE TYPE "AuditEvent" AS ENUM ('NEW', 'OUT_WITH_PROVIDER', 'EDITED', 'ANNUAL_REVIEW', 'REVIEWED', 'UNPUBLISHED', 'PUBLISHED', 'PINNED', 'UNPINNED', 'DELETED', 'UNDEFINED');

-- CreateEnum - this type is dropped and re-created as you cannot call ALTER TYPE....ADD in postgres 11 or below.  Although using
-- Postgres 13, the initial migration failed in prod, hence, trying another strategy.
DROP TYPE "Status" CASCADE;
CREATE TYPE "Status" AS ENUM ('NEW','OUT_WITH_PROVIDER','EDITED','ANNUAL_REVIEW','REVIEW_OVERDUE','REVIEWED','PUBLISHED','UNPUBLISHED');

-- AlterTable
ALTER TABLE "ListItem" ADD COLUMN     "status" "Status" NOT NULL DEFAULT E'NEW';

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
