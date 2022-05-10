Then(
  "I see the notification that {string} has been {string}",
  (contactName, action) => {
    cy.get(`[data-testid="organisation-name-${contactName}"]`)
      .invoke("text")
      .then((organisationName) => {
        cy.findByText(`${organisationName} has been ${action}`, {
          exact: false,
        });
      });
  }
);
