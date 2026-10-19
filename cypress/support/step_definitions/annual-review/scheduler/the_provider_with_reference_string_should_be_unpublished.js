import { Then } from "@badeball/cypress-cucumber-preprocessor";

Then("the provider with reference {string} should be unpublished", (reference) => {
  cy.task("db", {
    operation: "listItem.findFirst",
    variables: {
      where: {
        reference,
      },
    },
  }).then((listItem) => {
    cy.expect(listItem.isPublished).to.equal(false);
  });
});
