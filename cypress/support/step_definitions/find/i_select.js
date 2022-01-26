When(/I select \[([^]+)]$/, (arrayAsString) => {
  const checkboxes = arrayAsString.split(",");
  checkboxes.forEach((checkbox) => {
    cy.findByText(checkbox).click();
  });
});

When("I select {string}", (string) => {
  cy.findByText(string).click();
});
