-- This is an empty migration.
UPDATE "List"
SET "jsonData" = "jsonData" || '{"nextAnnualReviewStartDate": "2023-03-07T12:00:00.000Z"}'::jsonb,
    "nextAnnualReviewStartDate" = '2023-03-07T12:00:00.000Z'
WHERE "jsonData"->>'users' IS NOT NULL;