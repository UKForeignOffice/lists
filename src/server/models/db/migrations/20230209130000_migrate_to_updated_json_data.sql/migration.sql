-- update jsonData.updatedJsonData with the updatedJsonData value in a corresponding Event record for any list items in EDITED status

with ListItemWithEditEvent as (
  select "ListItem"."id", "ListItem"."jsonData" jsonData, "ListItem"."jsonData"->'updatedJsonData' updatedJsonData, "Event"."jsonData"->'updatedJsonData' eventJsonData
  from "ListItem"
    inner join "Event" on "ListItem".id = "Event"."listItemId"
  where "ListItem"."status" = 'EDITED'
    and "Event".type = 'EDITED'
    and "ListItem"."jsonData"->'updatedJsonData' is null)

update "ListItem"
  set "jsonData" = JSONB_SET(jsonData, '{updatedJsonData}', ListItemWithEditEvent.jsonData || ListItemWithEditEvent.eventJsonData)
  from ListItemWithEditEvent
  where ListItemWithEditEvent.id = "ListItem"."id";
