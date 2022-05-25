-- CreateEnum
DROP TYPE IF EXISTS "ListItemEvent" CASCADE;
CREATE TYPE "ListItemEvent" AS ENUM ('NEW', 'CHANGES_REQUESTED', 'EDITED', 'ANNUAL_REVIEW', 'UNPUBLISHED', 'PUBLISHED');

-- CreateEnum
DROP TYPE IF EXISTS "Status" CASCADE;
CREATE TYPE "Status" AS ENUM ('NEW');

-- AlterTable
ALTER TABLE "ListItem" ADD COLUMN     "status" "Status" NOT NULL DEFAULT E'NEW';

-- CreateTable
DROP TABLE IF EXISTS "Event" CASCADE;
CREATE TABLE "Event" (
    "id" SERIAL NOT NULL,
    "time" TIMESTAMP(3) NOT NULL,
    "listItemId" INTEGER NOT NULL,
    "type" "ListItemEvent" NOT NULL,
    "jsonData" JSONB NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
DROP TABLE IF EXISTS "_ListItemToUser" CASCADE;
CREATE TABLE "_ListItemToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ListItemToUser_AB_unique" ON "_ListItemToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_ListItemToUser_B_index" ON "_ListItemToUser"("B");

-- AddForeignKey
ALTER TABLE "Event" ADD FOREIGN KEY ("listItemId") REFERENCES "ListItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ListItemToUser" ADD FOREIGN KEY ("A") REFERENCES "ListItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ListItemToUser" ADD FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
