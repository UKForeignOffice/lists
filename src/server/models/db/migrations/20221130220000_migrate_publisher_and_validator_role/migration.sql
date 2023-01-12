-- Migrate list.jsonData.publishers, list.jsonData.administrators and Migrate list.jsonData.validators to just users

update "List"
set "jsonData" = jsonb_set(cast("jsonData" as jsonb), '{users}',
                           (select distinct (
                            coalesce("jsonData" -> 'publishers', '[]'::jsonb)
                            || coalesce("jsonData" -> 'validators', '[]'::jsonb)
                            || coalesce("jsonData" -> 'administrators', '[]'::jsonb)
                           )), true);


-- Remove any duplicates in list.jsonData.users
update "List"
set "jsonData" =  jsonb_set(cast("jsonData" as jsonb), '{users}', to_jsonb(array((select distinct jsonb_array_elements_text("jsonData"->'users')))), true);


-- Rename User.jsonData.roles = SuperAdmin to Administrator

update "User"
set "jsonData" =  jsonb_set(cast("jsonData" as jsonb), '{roles}', '["Administrator"]'::jsonb, true) where "jsonData"->'roles' ?| array['SuperAdmin'];
