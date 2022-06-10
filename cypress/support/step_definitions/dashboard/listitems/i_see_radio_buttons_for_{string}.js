Then("I see radio buttons {string}", (radioButtons) => {
  const items = radioButtons.split(",");
  if (Array.isArray(items)) {
    for (const item of items) {
      cy.findByText(item, { exact: false });
    }
  }
});

And("I do not see radio buttons {string}", (radioButtons) => {
  const items = radioButtons.split(",");
  if (Array.isArray(items)) {
    for (const item of items) {
      cy.findByText(item, { exact: false })
        .should("not.exist");
    }
  }
});
