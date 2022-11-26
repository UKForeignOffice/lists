-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_listItemId_fkey";

-- AddForeignKey
ALTER TABLE "Event" ADD FOREIGN KEY ("listItemId") REFERENCES "ListItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
