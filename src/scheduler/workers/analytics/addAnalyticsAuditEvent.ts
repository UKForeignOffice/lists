import { prisma } from "scheduler/workers/model";

const truncateMessage = "... truncated due to max length";
const MAX_BYTES = 7000 - Buffer.byteLength(truncateMessage);

function getByteLength(string: string) {
  return Buffer.byteLength(string);
}

function truncateString(string: string, maxSize: number, hasTruncated = false): string {
  if (getByteLength(string) <= maxSize) {
    return `${string}${hasTruncated ? truncateMessage : ""}`;
  }
  const sliceAmount = !hasTruncated ? maxSize : maxSize + 16;
  return truncateString(string.slice(0, sliceAmount), maxSize, true);
}

export async function addAnalyticsAuditEvent(view: string, dataSent: any[], response: any) {
  const maxSize = MAX_BYTES - getByteLength(JSON.stringify({ data: "", response }));
  const truncatedData = truncateString(JSON.stringify(dataSent), maxSize);

  await prisma.audit.create({
    data: {
      auditEvent: "ANALYTICS",
      createdAt: new Date(),
      jsonData: {
        view,
        dataSent: truncatedData,
        response,
      },
    },
  });
}
