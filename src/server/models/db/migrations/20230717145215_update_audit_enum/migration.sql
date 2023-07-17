/*
  Warnings:

  - The values [OUT_WITH_PROVIDER,EDITED,REVIEWED,UNPUBLISHED,PUBLISHED,PINNED,UNPINNED] on the enum `AuditEvent` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
-- 1. Rename the enum type you want to change
ALTER TYPE "AuditEvent" RENAME TO "_AuditEvent";

-- 2. Create the new enum type
CREATE TYPE "AuditEvent" AS ENUM ('NEW', 'ANNUAL_REVIEW', 'DELETED', 'UNDEFINED', 'REMINDER', 'ANALYTICS', 'LIST_EDIT');

-- 3. Rename the column(s) which use the old enum type
ALTER TABLE "Audit" RENAME COLUMN "auditEvent" TO "_auditEvent";

-- 4. Add new column of the new type
ALTER TABLE "Audit" ADD "auditEvent" "AuditEvent" NOT NULL DEFAULT 'NEW';

-- 5. Copy values to the new column
UPDATE "Audit" SET "auditEvent" = "_auditEvent"::text::"AuditEvent";

-- 6. Remove the old column and type
ALTER TABLE "Audit" DROP COLUMN "_auditEvent";
DROP TYPE "_AuditEvent";
