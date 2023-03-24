-- Create FirstPublishedOnList view with the columns, listId, firstPublished, eventId
-- select distinct on (l.id), similar to group by, ensures only 1 entry appears per listId
-- min(e.time) selects the earliest time a published event occurred (firstPublished)
create view "FirstPublishedOnList" as (
 select distinct on (l.id) "listId", min(e.time) over (partition by l.id) "firstPublished", e.id "eventId", l."nextAnnualReviewStartDate"
 from (select "id", "nextAnnualReviewStartDate" from "List") l
          inner join (select "listId", "id" from "ListItem") li ON li."listId" = l.id
          inner join (select time, type, id, "listItemId" from "Event" where type = 'PUBLISHED') e on li.id = "listItemId"
        );


