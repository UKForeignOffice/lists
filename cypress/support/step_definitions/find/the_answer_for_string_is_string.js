Then("the answer for {string} is {string}", (label, value) => {
  cy.findByLabelText(label).contains(value);
});
