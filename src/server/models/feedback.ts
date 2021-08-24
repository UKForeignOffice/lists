import { prisma } from "./db/prisma-client";
import { logger } from "server/services/logger";
import { Feedback, FeedbackCreateInput } from "./types";

export async function createFeedback(
  data: Pick<FeedbackCreateInput, "type" | "jsonData">
): Promise<Feedback> {
  if (data.type === undefined) {
    throw new Error("Feedback type is required");
  }

  try {
    return await prisma.feedback.create({ data });
  } catch (error) {
    logger.error(`createFeedback Error: ${error.message}`);
    throw error;
  }
}

export async function findFeedbackByType(
  type: Feedback["type"]
): Promise<Feedback[]> {
  if (type === undefined) {
    throw new Error("Feedback type is required");
  }

  try {
    return await prisma.feedback.findMany({
      where: { type },
    });
  } catch (error) {
    logger.error(`findFeedbackByType Error: ${error.message}`);
    throw error;
  }
}
