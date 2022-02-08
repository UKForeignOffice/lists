When("I click the link {string}", (string) => {
  cy.findByText(string).click();
});
