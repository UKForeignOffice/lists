Then("there is no answer for {string}", (label) => {
  cy.findByLabelText(label).should("not.exist");
});
