/*
  Warnings:

  - You are about to drop the column `listItemId` on the `Audit` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ListItemEvent" AS ENUM ('NEW', 'OUT_WITH_PROVIDER', 'EDITED', 'ANNUAL_REVIEW', 'REVIEWED', 'UNPUBLISHED', 'PUBLISHED', 'PINNED', 'UNPINNED', 'DELETED', 'UNDEFINED');

-- DropForeignKey
ALTER TABLE "Audit" DROP CONSTRAINT "Audit_listItemId_fkey";

-- DropIndex
DROP INDEX "Audit.listItemId_index";

-- AlterTable
ALTER TABLE "Audit" DROP COLUMN "listItemId";

-- CreateTable
CREATE TABLE "Event" (
    "id" SERIAL NOT NULL,
    "time" TIMESTAMP(3) NOT NULL,
    "listItemId" INTEGER NOT NULL,
    "type" "ListItemEvent" NOT NULL,
    "jsonData" JSONB NOT NULL,

    PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Event" ADD FOREIGN KEY ("listItemId") REFERENCES "ListItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
