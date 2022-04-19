-- CreateEnum
CREATE TYPE "AuditEvent" AS ENUM ('NEW', 'OUT_WITH_PROVIDER', 'EDITED', 'ANNUAL_REVIEW', 'REVIEWED', 'UNPUBLISHED', 'PUBLISHED', 'PINNED', 'UNPINNED', 'DELETED', 'UNDEFINED');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('NEW', 'OUT_WITH_PROVIDER', 'EDITED', 'ANNUAL_REVIEW', 'REVIEW_OVERDUE', 'REVIEWED', 'PUBLISHED', 'UNPUBLISHED');

-- AlterTable
ALTER TABLE "Audit" ADD COLUMN     "auditEvent" "AuditEvent" NOT NULL DEFAULT E'UNDEFINED',
ADD COLUMN     "listItemId" INTEGER;

-- AlterTable
ALTER TABLE "ListItem" ADD COLUMN     "status" "Status" NOT NULL DEFAULT E'NEW';

-- CreateTable
CREATE TABLE "_ListItemToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ListItemToUser_AB_unique" ON "_ListItemToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_ListItemToUser_B_index" ON "_ListItemToUser"("B");

-- CreateIndex
CREATE INDEX "Audit.listItemId_index" ON "Audit"("listItemId");

-- AddForeignKey
ALTER TABLE "Audit" ADD FOREIGN KEY ("listItemId") REFERENCES "ListItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ListItemToUser" ADD FOREIGN KEY ("A") REFERENCES "ListItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ListItemToUser" ADD FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
