-- CreateTable
CREATE TABLE "_ListToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ListToUser_AB_unique" ON "_ListToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_ListToUser_B_index" ON "_ListToUser"("B");

-- AddForeignKey
ALTER TABLE "_ListToUser" ADD CONSTRAINT "_ListToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "List"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ListToUser" ADD CONSTRAINT "_ListToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

select "List"."jsonData"->user, "List".id
    from "List"
    -- get the userId from the email
    -- keep listId