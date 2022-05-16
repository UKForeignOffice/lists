import { checkboxCSVToArray } from "./helpers";
import {
  WebhookDeserialisers,
  TestType,
  turnaroundTimeProperties,
} from "./types";
import { ServiceType } from "server/models/types";

export const covidTestProviderDeserialiser: WebhookDeserialisers[ServiceType.covidTestProviders] =
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
