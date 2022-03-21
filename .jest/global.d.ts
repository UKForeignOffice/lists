import {
  CovidTestSupplierFormWebhookData,
  LawyersFormWebhookData,
} from "../src/server/components/formRunner";

declare var webhookData = {
  lawyer: LawyersFormWebhookData,
  covidTestProvider: CovidTestSupplierFormWebhookData,
};

declare global {
  var webhookData = {
    lawyer: LawyersFormWebhookData,
    covidTestProvider: CovidTestSupplierFormWebhookData,
  };
}
declare module global {
  var webhookData = {
    lawyer: LawyersFormWebhookData,
    covidTestProvider: CovidTestSupplierFormWebhookData,
  };
}

declare module globalThis {
  var webhookData = {
    lawyer: LawyersFormWebhookData,
    covidTestProvider: CovidTestSupplierFormWebhookData,
  };
}
