/* eslint-disable */
And("click on the save button", () => {
  cy.findByRole("button", { name: "Save" }).click();
});
