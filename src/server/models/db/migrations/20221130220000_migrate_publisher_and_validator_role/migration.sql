-- Migrate list.jsonData.publishers, list.jsonData.administrators and Migrate list.jsonData.validators to just users

update "List"
set "jsonData" = jsonb_set(cast("jsonData" as jsonb), '{users}',
                           (select distinct (
                            coalesce("jsonData" -> 'publishers', '[]'::jsonb)
                            || coalesce("jsonData" -> 'validators', '[]'::jsonb)
                            || coalesce("jsonData" -> 'administrators', '[]'::jsonb)
                           )), true);
