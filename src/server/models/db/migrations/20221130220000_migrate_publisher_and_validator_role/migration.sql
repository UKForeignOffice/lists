-- Migrate list.jsonData.publishers, list.jsonData.administrators and Migrate list.jsonData.validators to just users

update "List"
set "jsonData" = jsonb_set(cast("jsonData" as jsonb), '{users}',
                           (select distinct (
                            coalesce("jsonData" -> 'publishers', '[]'::jsonb)
                            || coalesce("jsonData" -> 'validators', '[]'::jsonb)
                            || coalesce("jsonData" -> 'administrators', '[]'::jsonb)
                           )), true);


-- Rename User.jsonData.roles = SuperAdmin to Administrator

update "User"
set "jsonData" =  jsonb_set(cast("jsonData" as jsonb), '{roles}', '["Administrator"]'::jsonb, true) where "jsonData"->'roles' ?| array['SuperAdmin'];


