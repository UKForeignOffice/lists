import { Express } from 'express';
import { feedbackRouter } from "./router";

export async function initFeedback(server: Express): Promise<void> {
  server.use(feedbackRouter);
}

export function getFeedbackSuccessContent(): string {
  // used by form-runner middleware to replace form submission success page content
  return `
    <div class="govuk-grid-row">
      <div class="govuk-grid-column-two-thirds">
        <div class="govuk-panel govuk-panel--confirmation">
          <h1 class="govuk-panel__title">
            Thank you
          </h1>
        </div>
        <p class="govuk-body">
          Your feedback will help us to improve this service.
        </p>
      </div>
    </div>
  `
}
