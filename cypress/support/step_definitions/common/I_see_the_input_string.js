Then("I see the input {string}", (string) => {
  cy.findByRole("textbox", { name: string });
});
