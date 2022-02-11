-- AlterTable
ALTER TABLE "ListItem" ADD COLUMN     "listId" INTEGER NOT NULL DEFAULT -1;

UPDATE "ListItem" listSource SET "listId" = l."id"
FROM "ListItem" li
         INNER JOIN "Address" addr ON li."addressId" = addr."id"
         INNER JOIN "List" l ON l."countryId" = addr."countryId" AND l."type" = 'covidTestProviders'
WHERE li."type" = 'covidTestProviders'
  and l."type" = 'covidTestProviders'
  and listSource."type" = 'covidTestProviders'
  and li."id" = listSource."id";

UPDATE "ListItem" listSource SET "listId" = l."id"
FROM "ListItem" li
         INNER JOIN "Address" addr ON li."addressId" = addr."id"
         INNER JOIN "List" l ON l."countryId" = addr."countryId" AND l."type" = 'lawyers'
WHERE li."type" = 'lawyers'
  and l."type" = 'lawyers'
  and listSource."type" = 'lawyers'
  and li."id" = listSource."id";
