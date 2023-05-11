import { prisma } from "scheduler/workers/model";
import { differenceInDays, startOfDay, startOfToday } from "date-fns";
import { config } from "./config";
import { schedulerLogger } from "scheduler/logger";

const logger = schedulerLogger.child({ method: "analytics" });

export async function shouldExportViewName(viewName: string) {
  const today = startOfToday();

  const lastSuccessfulExport = await findLastSuccessfulExportForView(viewName);

  if (!lastSuccessfulExport) {
    return true;
  }

  logger.info(`Last successful export for ${viewName} was ${lastSuccessfulExport.createdAt.toISOString()}`);

  const daysSinceLastExport = differenceInDays(today, startOfDay(lastSuccessfulExport.createdAt));
  const shouldExport = daysSinceLastExport >= config.frequencyInDays;

  if (!shouldExport) {
    logger.info(
      `Has only been ${daysSinceLastExport} days. Exports are scheduled every ${config.frequencyInDays} days`
    );
  }

  return shouldExport;
}

async function findLastSuccessfulExportForView(viewName: string) {
  return await prisma.audit.findFirst({
    where: {
      type: "ANALYTICS",
      AND: [
        {
          jsonData: {
            path: ["view"],
            equals: viewName,
          },
        },
      ],
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}
