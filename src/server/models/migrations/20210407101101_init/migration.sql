-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRoles" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" VARCHAR(255) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lawyer" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "contactName" VARCHAR(255) NOT NULL,
    "lawFirmName" VARCHAR(255) NOT NULL,
    "telephone" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255),
    "website" VARCHAR(255),
    "description" TEXT,
    "addressId" INTEGER NOT NULL,
    "regionsServed" TEXT,
    "legalAid" BOOLEAN NOT NULL DEFAULT false,
    "proBonoService" BOOLEAN NOT NULL DEFAULT false,
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
CREATE TABLE "Region" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "countryId" INTEGER NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_UserToUserRoles" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_LawyerToLegalPracticeAreas" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User.email_unique" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Lawyer.lawFirmName_unique" ON "Lawyer"("lawFirmName");

-- CreateIndex
CREATE UNIQUE INDEX "LegalPracticeAreas.name_unique" ON "LegalPracticeAreas"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Country.name_unique" ON "Country"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_UserToUserRoles_AB_unique" ON "_UserToUserRoles"("A", "B");

-- CreateIndex
CREATE INDEX "_UserToUserRoles_B_index" ON "_UserToUserRoles"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_LawyerToLegalPracticeAreas_AB_unique" ON "_LawyerToLegalPracticeAreas"("A", "B");

-- CreateIndex
CREATE INDEX "_LawyerToLegalPracticeAreas_B_index" ON "_LawyerToLegalPracticeAreas"("B");

-- AddForeignKey
ALTER TABLE "Lawyer" ADD FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Region" ADD FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserToUserRoles" ADD FOREIGN KEY ("A") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserToUserRoles" ADD FOREIGN KEY ("B") REFERENCES "UserRoles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LawyerToLegalPracticeAreas" ADD FOREIGN KEY ("A") REFERENCES "Lawyer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LawyerToLegalPracticeAreas" ADD FOREIGN KEY ("B") REFERENCES "LegalPracticeAreas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
