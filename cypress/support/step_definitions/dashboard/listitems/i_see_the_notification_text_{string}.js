Then(
  "I see the notification text {string}",
  (notificationText) => {
    cy.findByText(notificationText).should("exist");
  }
);
