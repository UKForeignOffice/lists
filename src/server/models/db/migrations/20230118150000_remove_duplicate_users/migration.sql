-- Remove any duplicates in list.jsonData.users
update "List"
set "jsonData" =  jsonb_set(cast("jsonData" as jsonb), '{users}', to_jsonb(array((select distinct jsonb_array_elements_text("jsonData"->'users')))), true);
