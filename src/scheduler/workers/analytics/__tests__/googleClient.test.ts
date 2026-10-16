import { sheets } from "@googleapis/sheets";
import { addAnalyticsAuditEvent } from "../addAnalyticsAuditEvent";
import { shouldExportViewName } from "../shouldExportViewName";
import { updateSheet } from "../googleClient";
import { schedulerLogger } from "scheduler/logger";

jest.mock("@googleapis/sheets", () => ({
  auth: {
    GoogleAuth: jest.fn(),
  },
  sheets: jest.fn(() => ({
    spreadsheets: {
      values: {
        update: jest.fn(),
      },
    },
  })),
}));

jest.mock("../addAnalyticsAuditEvent", () => ({
  addAnalyticsAuditEvent: jest.fn(),
}));

jest.mock("../config", () => ({
  config: {
    spreadsheetId: "test-spreadsheet-id",
    projectId: "test-project-id",
    auth: {
      type: "service_account",
      client_id: "synthetic-client-id",
      client_email: "sheets-test@example.invalid",
      private_key: "synthetic-test-key",
    },
  },
}));

jest.mock("../shouldExportViewName", () => ({
  shouldExportViewName: jest.fn(),
}));

jest.mock("scheduler/logger", () => ({
  schedulerLogger: {
    child: jest.fn(() => ({
      info: jest.fn(),
      error: jest.fn(),
    })),
  },
}));

const update = jest.mocked(sheets).mock.results[0].value.spreadsheets.values.update as jest.Mock;
const logger = jest.mocked(schedulerLogger).child.mock.results[0].value;

describe("updateSheet", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(shouldExportViewName).mockResolvedValue(true);
  });

  test("skips the Sheets API when the view is not scheduled for export", async () => {
    jest.mocked(shouldExportViewName).mockResolvedValueOnce(false);

    await expect(updateSheet("Analytics!A1:B2", [["value"]])).resolves.toBeUndefined();

    expect(update).not.toHaveBeenCalled();
    expect(addAnalyticsAuditEvent).not.toHaveBeenCalled();
  });

  test("updates the sheet with the supplied options and records the response", async () => {
    const view = "Analytics!A1:B2";
    const values = [
      ["name", "count"],
      ["synthetic sample", 7],
    ];
    const response = { data: { updatedCells: 2, updatedRows: 1 } };
    update.mockResolvedValueOnce(response);

    await expect(updateSheet(view, values, "USER_ENTERED")).resolves.toBe(response);

    expect(update).toHaveBeenCalledWith({
      range: view,
      spreadsheetId: "test-spreadsheet-id",
      valueInputOption: "USER_ENTERED",
      requestBody: { values },
    });
    expect(addAnalyticsAuditEvent).toHaveBeenCalledWith(view, values, response.data);
  });

  test("uses RAW as the default input option", async () => {
    update.mockResolvedValueOnce({ data: {} });

    await updateSheet("Analytics!A1", [["synthetic sample"]]);

    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        valueInputOption: "RAW",
      })
    );
  });

  test("logs API failures and does not write an audit event", async () => {
    const view = "Analytics!A1";
    const error = new Error("synthetic API failure");
    update.mockRejectedValueOnce(error);

    await expect(updateSheet(view, [["synthetic sample"]])).resolves.toBeUndefined();

    expect(logger.error).toHaveBeenCalledWith(`sending data for ${view} failed with error ${error}`);
    expect(addAnalyticsAuditEvent).not.toHaveBeenCalled();
  });
});
