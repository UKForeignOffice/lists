Then(
  "I see the notification text {string}",
  (notificationText) => {
    cy.get('html:root')
      .eq(0)
      .invoke('prop', 'outerHTML')
      .then(doc => {
        cy.task("log", `PAGE HTML for list items with notification: ${doc}`);
      });

    cy.findByText(notificationText).should("exist");
  }
);
