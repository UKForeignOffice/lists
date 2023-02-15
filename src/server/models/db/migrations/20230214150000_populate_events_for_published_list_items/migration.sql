-- populate Event records for list items in PUBLISHED status that were published before the Event table was introduced

INSERT INTO "Event" ("listItemId", "time", "type", "jsonData")
select "ListItem"."id"        as "listItemId",
       "ListItem"."updatedAt" as "time",
       'PUBLISHED'            as "type",
       concat('{"eventName": "publish"}') ::json as "jsonData"
from "ListItem"
  left outer join "Event" on "Event"."listItemId" = "ListItem"."id" and "Event"."type" = 'PUBLISHED'
where "ListItem"."status" = 'PUBLISHED'
group by "ListItem"."id"
having count("Event"."id") = 0
