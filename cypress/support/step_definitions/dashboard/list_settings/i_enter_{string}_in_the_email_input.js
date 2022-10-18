/* eslint-disable */
Given("I enter {string} in the email input", (string) => {
  cy.findByLabelText("Enter an email address").type(string);
  cy.findByRole("button", { name: "Add to list" }).click();
});
