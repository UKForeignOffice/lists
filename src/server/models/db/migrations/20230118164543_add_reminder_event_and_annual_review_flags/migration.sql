-- AlterEnum
ALTER TYPE "AuditEvent" ADD VALUE 'REMINDER';

-- AlterEnum
ALTER TYPE "ListItemEvent" ADD VALUE 'REMINDER';

-- AlterTable
ALTER TABLE "List" ADD COLUMN     "isAnnualReview" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastAnnualReviewStartDate" DATE,
ADD COLUMN     "nextAnnualReviewStartDate" DATE NOT NULL DEFAULT NOW() + interval '1 year';

-- RenameIndex
ALTER INDEX "Audit.jsonData_index" RENAME TO "Audit_jsonData_idx";

-- RenameIndex
ALTER INDEX "Audit.type_index" RENAME TO "Audit_type_idx";

-- RenameIndex
ALTER INDEX "Country.name_unique" RENAME TO "Country_name_key";

-- RenameIndex
ALTER INDEX "Feedback.type_index" RENAME TO "Feedback_type_idx";

-- RenameIndex
ALTER INDEX "GeoLocation.location_index" RENAME TO "GeoLocation_location_idx";

-- RenameIndex
ALTER INDEX "List.reference_unique" RENAME TO "List_reference_key";

-- RenameIndex
ALTER INDEX "List.type_countryId_index" RENAME TO "List_type_countryId_idx";

-- RenameIndex
ALTER INDEX "ListItem.reference_unique" RENAME TO "ListItem_reference_key";

-- RenameIndex
ALTER INDEX "ListItem.type_reference_isApproved_isPublished_isBlocked_index" RENAME TO "ListItem_type_reference_isApproved_isPublished_isBlocked_idx";

-- RenameIndex
ALTER INDEX "User.email_unique" RENAME TO "User_email_key";
