import { Then } from "@badeball/cypress-cucumber-preprocessor";

Then("not the list items", (dataTable) => {
  const items = dataTable.raw();

  items.forEach((item) => {
    cy.findByText(item).should("not.exist");
  });
});
