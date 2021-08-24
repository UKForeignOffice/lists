-- CreateTable
CREATE TABLE "Feedback" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "jsonData" JSONB NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Feedback.type_index" ON "Feedback"("type");
