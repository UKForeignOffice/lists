-- AlterTable
ALTER TABLE "Address" ALTER COLUMN "postCode" DROP NOT NULL;

-- Update columns to revised names in jsonData
update "ListItem" as li1
set "jsonData" = "li1"."jsonData"
                   || (select jsonb_build_object('postCode', "Address"."postCode", 'address.firstLine', "Address"."firstLine", 'address.secondLine', "Address"."secondLine", 'city', "Address"."city", 'addressCountry', "Country"."name")
                       from "ListItem" as li2
                       inner join "Address" on "Address"."id" = "li2"."addressId"
                       inner join "Country" on "Country"."id" = "Address"."countryId"
                       where "li1"."id" = "li2"."id");

update "ListItem" as li1
set "jsonData" = "li1"."jsonData"
  || (select jsonb_build_object('contactPhoneNumber',"li2"."jsonData" -> 'emergencyPhoneNumber')
      from "ListItem" as li2
      where "li1"."id" = "li2"."id"
      and "li2"."jsonData" -> 'emergencyPhoneNumber' is not null
      and "li2"."jsonData" ->> 'emergencyPhoneNumber' <> '')
where "li1"."jsonData" -> 'emergencyPhoneNumber' is not null
      and "li1"."jsonData" ->> 'emergencyPhoneNumber' <> '';
