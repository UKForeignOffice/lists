import { checkboxCSVToArray } from "./helpers";
import { CovidTestSupplierFormWebhookData, WebhookDeserialiser } from "./types";

export const covidTestProviderDeserialiser: WebhookDeserialiser<CovidTestSupplierFormWebhookData> =
  (webhookData) => {
    const {
      providedTests: providedTestsString,
      resultsFormat,
      resultsReadyFormat,
      bookingOptions,
      ...rest
    } = webhookData;

    const providedTests = checkboxCSVToArray(providedTestsString).map(
      (testName) => {
        const type = testName as TestType;
        return {
          type,
          turnaroundTime: parseInt(turnaroundTimeProperties[type]),
        };
      }
    );

    return {
      ...rest,
      providedTests,
      resultsFormat: checkboxCSVToArray(resultsFormat),
      resultsReadyFormat: checkboxCSVToArray(resultsReadyFormat),
      bookingOptions: checkboxCSVToArray(bookingOptions),
      fastestTurnaround: Math.min(
        ...providedTests.map((test) => test.turnaroundTime)
      ),
    };
  };
