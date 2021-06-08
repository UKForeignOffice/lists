-- DropIndex
DROP INDEX "ListItem.jsonData_gin";

-- CreateTable
CREATE TABLE "List" (
    "id" SERIAL NOT NULL,
    "reference" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "countryId" INTEGER NOT NULL,
    "jsonData" JSONB NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "List.reference_unique" ON "List"("reference");

-- CreateIndex
CREATE INDEX "List.type_countryId_index" ON "List"("type", "countryId");

-- AddForeignKey
ALTER TABLE "List" ADD FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;
