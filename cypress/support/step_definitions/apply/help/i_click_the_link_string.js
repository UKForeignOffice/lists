When("I click the link {string}", (string) => {
  cy.findAllByText(string).eq(0).click();
});
