/*
  Warnings:

  - A unique constraint covering the columns `[countryId,type]` on the table `List` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "List_countryId_type_key" ON "List"("countryId", "type");
