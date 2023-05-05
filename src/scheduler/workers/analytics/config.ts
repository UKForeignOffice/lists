export const config = {
  spreadsheetId: process.env.ANALYTICS_SPREADSHEET_ID,
  projectId: process.env.ANALYTICS_PROJECT_ID,
  frequencyInDays: process.env.ANALYTICS_FREQUENCY_IN_DAYS ?? 7,
  auth: {
    type: process.env.ANALYTICS_TYPE,
    private_key_id: process.env.ANALYTICS_PRIVATE_KEY_ID,
    private_key: process.env.ANALYTICS_PRIVATE_KEY,
    client_email: process.env.ANALYTICS_CLIENT_EMAIL,
    client_id: process.env.ANALYTICS_CLIENT_ID,
    auth_uri: process.env.ANALYTICS_AUTH_URI,
    token_uri: process.env.ANALYTICS_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.ANALYTICS_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.ANALYTICS_CLIENT_X509_CERT_URL,
  },
};
