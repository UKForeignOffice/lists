export const listsRoutes = {
  start: "/",
  finder: "/find",
  results: "/results",
  feedback: "/feedback",
  feedbackSuccess: "/feedback/success",
  privateBeta: "/private-beta",
  formRunnerWebhook: "/ingest/:serviceType",
  formRunnerCallback: "/ingest/:serviceType/:id",
  confirmApplication: "/confirm/:reference",
  accessibility: "/help/accessibility-statement",
  termsAndConditions: "/help/terms-and-conditions",
} as const;