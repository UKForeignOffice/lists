-- create a CTE (temp table) joining Audit to Events. Returns a row when Audit is missing a matching (publish) event.
-- Only select the relevant columns and rename them to match `Event` insert.
with AuditWithoutMatchingListItemEvent as (select (a."jsonData" ->> 'itemId')::integer as "listItemId",
                                             a."createdAt"                        as time,
  a."jsonData"
from "Audit" a
  left outer join "Event" e on (a."jsonData" ->> 'itemId')::integer = e."listItemId"
where e.id is null
  and a."jsonData" ->> 'eventName' = 'publish'),

-- Create a CTE (temp table) joining the above audits to a ListItem. Returns when a row has a ListItem. (i.e. ListItem hasn't been deleted)
-- Only select the relevant columns (from above).
  AuditsToMigrate as (select a.*
from AuditWithoutMatchingListItemEvent a
  left outer join "ListItem" li on a."listItemId" = li.id
where li.id is not null)

insert
into "Event" ("listItemId", "time", "type", "jsonData")
select "listItemId", time, 'PUBLISHED', "jsonData"
from AuditsToMigrate;
