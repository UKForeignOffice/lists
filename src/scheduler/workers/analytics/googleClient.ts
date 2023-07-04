import { sheets, auth } from "@googleapis/sheets";
import { addAnalyticsAuditEvent } from "./addAnalyticsAuditEvent";
import { schedulerLogger } from "scheduler/logger";
import { config } from "./config";
import { shouldExportViewName } from "./shouldExportViewName";

const clientDetails = {
  /**
   * Log non-private details for transparency.
   */
  projectId: config.projectId,
  client_id: config.auth.client_id,
  type: config.auth.type,
  client_email: config.auth.client_email,
};

const logger = schedulerLogger.child({ method: "workers.analytics.updateSheet", ...clientDetails });

const googleAuth = new auth.GoogleAuth({
  credentials: config.auth,
  projectId: config.projectId,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const googleSheets = sheets({
  version: "v4",
  auth: googleAuth,
});

export async function updateSheet(view: string, values: any[], valueInputOption = "RAW") {
  const viewIsScheduledToBeExported = await shouldExportViewName(view);

  if (!viewIsScheduledToBeExported) {
    return;
  }

  logger.info(
    `sending view data for ${view} with headers: ${JSON.stringify(values[0])}. See Audit table to view all data sent`
  );

  try {
    const res = await googleSheets.spreadsheets.values.update({
      range: view,
      spreadsheetId: config.spreadsheetId,
      valueInputOption,
      requestBody: {
        values,
      },
    });

    await addAnalyticsAuditEvent(view, values, res.data);

    return res;
  } catch (e) {
    logger.error(`sending data for ${view} failed with error ${e}`);
  }
}
