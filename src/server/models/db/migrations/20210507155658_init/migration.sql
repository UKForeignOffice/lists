-- CreateTable
CREATE TABLE "ListItem" (
    "id" SERIAL NOT NULL,
    "reference" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "jsonData" JSONB NOT NULL,
    "addressId" INTEGER NOT NULL,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Address" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "firstLine" VARCHAR(255) NOT NULL,
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
CREATE EXTENSION postgis;
CREATE TABLE public."GeoLocation" (
    "id" SERIAL NOT NULL,
    "location" geography(POINT) NOT NULL,
    
    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL,
    "jsonData" JSONB NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GeoLocation.location_index" ON "GeoLocation"("location");

-- CreateIndex
CREATE UNIQUE INDEX "ListItem.reference_unique" ON "ListItem"("reference");

-- CreateIndex
CREATE INDEX "ListItem.type_reference_isApproved_isPublished_isBlocked_index" ON "ListItem"("type", "reference", "isApproved", "isPublished", "isBlocked");

-- CreateIndex
CREATE UNIQUE INDEX "Country.name_unique" ON "Country"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User.email_unique" ON "User"("email");

-- AddForeignKey
ALTER TABLE "ListItem" ADD FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD FOREIGN KEY ("geoLocationId") REFERENCES "GeoLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
