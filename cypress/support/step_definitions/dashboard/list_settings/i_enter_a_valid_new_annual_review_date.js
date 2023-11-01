When("I enter a valid new annual review date", () => {
  const today = new Date();
  const targetMonth = (today.getMonth() + 3) % 12;

  cy.findByLabelText("Day").type(1);
  cy.findByLabelText("Month").type(targetMonth + 1);
});
