-- CreateTable
CREATE TABLE "List" (
    "id" SERIAL NOT NULL,
    "reference" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "jsonData" JSONB NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "List.reference_unique" ON "List"("reference");

-- CreateIndex
CREATE INDEX "List.jsonData_gin" ON "List" USING gin ("jsonData");

