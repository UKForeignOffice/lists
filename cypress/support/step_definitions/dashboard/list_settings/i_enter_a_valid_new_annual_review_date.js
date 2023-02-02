When("I enter a valid new annual review date", () => {
  const today = new Date();
  cy.findByLabelText("Day").type(1);
  cy.findByLabelText("Month").type(today.getMonth() + 3);
});
