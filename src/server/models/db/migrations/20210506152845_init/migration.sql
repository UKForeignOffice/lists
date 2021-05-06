-- CreateTable
CREATE TABLE "Lawyer" (
    "id" SERIAL NOT NULL,
    "reference" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lawFirmName" VARCHAR(255) NOT NULL,
    "contactName" VARCHAR(255) NOT NULL,
    "telephone" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255),
    "website" VARCHAR(255),
    "addressId" INTEGER NOT NULL,
    "legalAid" BOOLEAN NOT NULL DEFAULT false,
    "proBonoService" BOOLEAN NOT NULL DEFAULT false,
    "extendedProfile" JSONB,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LegalPracticeAreas" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" VARCHAR(255) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Address" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "firsLine" VARCHAR(255) NOT NULL,
    "secondLine" VARCHAR(255),
    "city" VARCHAR(255),
    "postCode" VARCHAR(255) NOT NULL,
    "countryId" INTEGER NOT NULL,
    "geoLocationId" INTEGER,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Country" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" VARCHAR(255) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_LawyerToLegalPracticeAreas" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Lawyer.reference_unique" ON "Lawyer"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "Lawyer.lawFirmName_unique" ON "Lawyer"("lawFirmName");

-- CreateIndex
CREATE UNIQUE INDEX "LegalPracticeAreas.name_unique" ON "LegalPracticeAreas"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Country.name_unique" ON "Country"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_LawyerToLegalPracticeAreas_AB_unique" ON "_LawyerToLegalPracticeAreas"("A", "B");

-- CreateIndex
CREATE INDEX "_LawyerToLegalPracticeAreas_B_index" ON "_LawyerToLegalPracticeAreas"("B");

-- AddForeignKey
ALTER TABLE "Lawyer" ADD FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LawyerToLegalPracticeAreas" ADD FOREIGN KEY ("A") REFERENCES "Lawyer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LawyerToLegalPracticeAreas" ADD FOREIGN KEY ("B") REFERENCES "LegalPracticeAreas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
