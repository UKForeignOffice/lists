-- Delete all lstItem audit events.
DELETE FROM "Audit"
WHERE type = 'listItem';
