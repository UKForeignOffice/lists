When("I click the link {string} for {string}", (link, country) => {
  cy.findByText(country).parent().findByText(link).click()
});
