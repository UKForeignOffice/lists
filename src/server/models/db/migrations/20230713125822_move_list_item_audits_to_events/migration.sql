-- Move Reminder audit events to Event table: (https://www.db-fiddle.com/f/pAsG9CgsiMz5YMZZo9FJ1t/0)
-- NOTE: Event table entries contain response data from Notify emails. Since Audit doesn't have this, it won't be included when entries are moved
INSERT INTO "Event" ("time", "listItemId", "type", "jsonData")
SELECT  "createdAt",
        ("jsonData"->>'itemId')::int,
        "auditEvent",
        jsonb_set(
          '{}'::jsonb,
          '{reference}',
          to_jsonb("jsonData"->'annualReviewRef')) ||
          jsonb_build_object('notes', '["sendStartedProviderEmail"]') ||
          jsonb_build_object('eventName', '["reminder"]')
FROM "Audit"
WHERE type = 'listItem'
AND "auditEvent" = 'REMINDER';

-- Delete all lstItem audit events.
DELETE FROM "Audit"
WHERE type = 'listItem';
