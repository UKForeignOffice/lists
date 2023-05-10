import { prisma } from "scheduler/workers/model";

const truncateMessage = "... truncated due to max length";
const MAX_BYTES = 7000 - Buffer.byteLength(truncateMessage);

export async function addAnalyticsAuditEvent(view: string, dataSent: unknown[], response: unknown) {
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

function getByteLength(string: string) {
  return Buffer.byteLength(string);
}

function truncateString(string: string, maxByteLength: number, hasTruncated = false): string {
  /**
   * Recursive function which will keep removing characters until the string is the byte under limit.
   * JS (node 14) does not natively support truncating/slicing by byte length, and due to UTF-16,
   * characters may be 2-5+ bytes long, hence "estimatedMaxCharLength".
   * TODO: refactor to use `Blob` available in node 15+.
   */
  const stringByteLength = getByteLength(string);
  if (stringByteLength <= maxByteLength) {
    return `${string}${hasTruncated ? truncateMessage : ""}`;
  }
  const estimatedMaxCharLength = Math.ceil(maxByteLength / 2);
  const sliceAmount = !hasTruncated ? estimatedMaxCharLength : estimatedMaxCharLength - 16;
  return truncateString(string.slice(0, sliceAmount), maxByteLength, true);
}
