-- Create FirstPublishedOnList view with the columns, listId, firstPublished, eventId
-- select distinct on (l.id), similar to group by, ensures only 1 entry appears per listId
-- min(e.time) selects the earliest time a published event occurred (firstPublished)
create view "FirstPublishedOnList" as (
  select distinct on (l.id) "listId", min(e.time) over (partition by l.id) "firstPublished", e.id "eventId"
  from (select time, type, id, "listItemId" from "Event" where type = 'PUBLISHED') e
  inner join (select "listId", "id" from "ListItem") li ON e."listItemId" = li.id
  inner join "List" l ON li."listId" = l.id);
