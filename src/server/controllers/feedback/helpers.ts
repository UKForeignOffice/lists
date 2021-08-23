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
          Your feedback will help us improve the service....
        </p>
      </div>
    </div>
  `
}