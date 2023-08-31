-- CreateTable
CREATE TABLE "_ListToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex - makes sure no two rows are the same
CREATE UNIQUE INDEX "_ListToUser_AB_unique" ON "_ListToUser"("A", "B");

-- CreateIndex -  to improve efficiency of filtering or searching on the "B" column
CREATE INDEX "_ListToUser_B_index" ON "_ListToUser"("B");

-- AddForeignKey
ALTER TABLE "_ListToUser" ADD CONSTRAINT "_ListToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "List"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ListToUser" ADD CONSTRAINT "_ListToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create entry is User table for emails in List.jsonData users that don't have one
INSERT INTO "User" (email, "updatedAt", "jsonData")
SELECT DISTINCT email, now() as "updatedAt", '{"roles": []}'::jsonb
FROM (
    SELECT jsonb_array_elements_text("List"."jsonData"->'users') AS email
    FROM "List"
) AS l
WHERE NOT EXISTS (
    SELECT 1
    FROM "User" u
    WHERE u.email = l.email
);

-- Populate table with List and User id, based on jsonData.users from the List table
INSERT INTO "_ListToUser" ("A", "B")
SELECT "List"."id", "User"."id"
FROM "List"
JOIN "User" ON "User"."email" IN (
    SELECT jsonb_array_elements_text("List"."jsonData"->'users')
);
