When("I click the link {string} for {string}", (link, country) => {
  cy.findByText(country).then(result => {
    result.parent().find(link).click();
  });
});
