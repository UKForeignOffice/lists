-- CreateTable
CREATE TABLE "Audit" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "type" TEXT,
    "jsonData" JSONB NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Audit.type_index" ON "Audit"("type");

-- CreateIndex
CREATE INDEX "Audit.jsonData_index" ON "Audit" USING gin ("jsonData");
