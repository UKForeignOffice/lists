-- Migrate list.jsonData.publishers, list.jsonData.administrators and Migrate list.jsonData.validators to users

update "List"
set "jsonData" = jsonb_set(cast("jsonData" as jsonb), '{users}',
                           (select distinct (coalesce(("jsonData" -> 'publishers'), '[]') || coalesce("jsonData" -> 'validators', '[]')) || coalesce("jsonData" -> 'administrators', '[]')), true);
