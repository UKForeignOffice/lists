-- Move Reminder audit events to Event table: (https://www.db-fiddle.com/f/pAsG9CgsiMz5YMZZo9FJ1t/0)
-- NOTE: Event table entries contain response data from Notify emails. Since Audit doesn't have this, it won't be included when entries are moved
INSERT INTO "Event" ("time", "listItemId", "type", "jsonData")
SELECT  a."createdAt" "createdAt",
        (a."jsonData"->>'itemId')::int,
        'REMINDER',
        jsonb_build_object(
          'reference', a."jsonData"->'annualReviewRef',
          'notes', jsonb_build_array(a."jsonData"->>'reminderType'),
          'eventName', a."jsonData"->'eventName'
        )
FROM "Audit" a
INNER JOIN "ListItem" l ON (a."jsonData"->>'itemId')::int = l.id
WHERE a.type = 'listItem'
AND "auditEvent" = 'REMINDER'
-- Prevent duplicate entries
AND NOT EXISTS (
  SELECT 1
  FROM "Event" e
  WHERE e."listItemId" = (a."jsonData"->>'itemId')::int
  AND e.type = 'REMINDER'
  AND DATE(e.time) = DATE(a."createdAt")
);
