-- DropForeignKey
ALTER TABLE "ListItem" DROP CONSTRAINT "ListItem_listId_fkey";

-- AddForeignKey
ALTER TABLE "ListItem" ADD CONSTRAINT "ListItem_listId_fkey" FOREIGN KEY ("listId") REFERENCES "List"("id") ON DELETE CASCADE ON UPDATE CASCADE;
