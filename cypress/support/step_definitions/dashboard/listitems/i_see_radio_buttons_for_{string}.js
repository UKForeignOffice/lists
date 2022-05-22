Then("I see radio buttons", (radioButtons) => {
  cy.get("input[type=radio]", {timeout: 15000}).should("exist");
  const items = radioButtons.raw()[0];
  if (Array.isArray(items)) {
    for (const item of items) {
      cy.findByText(item, { exact: false });
    }
  }
});

And("I do not see radio buttons", (radioButtons) => {
  cy.get("input[type=radio]", {timeout: 15000}).should("exist");
  const items = radioButtons.raw()[0];
  if (Array.isArray(items)) {
    for (const item of items) {
      cy.findByText(item, { exact: false })
        .should("not.exist");
    }
  }
});
