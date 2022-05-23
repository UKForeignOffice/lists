Then("I see radio buttons", (radioButtons) => {
  cy.get("input[type=radio]").should("exist");
  const items = radioButtons.raw()[0];
  if (Array.isArray(items)) {
    for (const item of items) {
      cy.task("log", `finding text ${item}`);
      cy.findByText(item, { exact: false });
    }
  }
});

And("I do not see radio buttons", (radioButtons) => {
  const items = radioButtons.raw()[0];
  if (Array.isArray(items)) {
    for (const item of items) {
      cy.task("log", `finding text ${item}`);
      cy.findByText(item, { exact: false })
        .should("not.exist");
    }
  }
});
