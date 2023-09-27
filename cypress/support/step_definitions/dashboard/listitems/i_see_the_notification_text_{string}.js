Then("I see the notification text {string}", (notificationText) => {
  cy.get(".govuk-notification-banner__heading").contains(notificationText);
});
