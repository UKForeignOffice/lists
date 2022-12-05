-- Migrate list.jsonData.publishers, list.jsonData.administrators, and Migrate list.jsonData.validators to just users

update "List"
set "jsonData" = jsonb_set(cast("jsonData" as jsonb), '{users}',
                           (select distinct (("jsonData" -> 'publishers') || ("jsonData" -> 'validators')) || ("jsonData" -> 'administrators')), true);
