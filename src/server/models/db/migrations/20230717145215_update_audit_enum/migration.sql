/*
  Warnings:

  - The values [OUT_WITH_PROVIDER,EDITED,REVIEWED,PUBLISHED,PINNED,UNPINNED] on the enum `AuditEvent` are removed here. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
ALTER TYPE "AuditEvent" RENAME TO "_AuditEvent";
CREATE TYPE "AuditEvent" AS ENUM ('NEW', 'ANNUAL_REVIEW', 'DELETED', 'UNDEFINED', 'REMINDER', 'ANALYTICS', 'LIST_EDIT', 'UNPUBLISHED');
ALTER TABLE "Audit" RENAME COLUMN "auditEvent" TO "_auditEvent";
ALTER TABLE "Audit" ADD "auditEvent" "AuditEvent" NOT NULL DEFAULT 'NEW';
UPDATE "Audit" SET "auditEvent" = "_auditEvent"::text::"AuditEvent";
ALTER TABLE "Audit" DROP COLUMN "_auditEvent";
DROP TYPE "_AuditEvent";
