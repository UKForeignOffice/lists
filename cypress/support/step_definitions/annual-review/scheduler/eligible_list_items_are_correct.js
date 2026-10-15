import { Then } from "@badeball/cypress-cucumber-preprocessor";

Then("eligible list items are correct", () => {
  cy.task("db", {
    operation: "list.findFirst",
    variables: {
      where: {
        reference: "SMOKE",
      },
    },
  }).then((list) => {
    cy.expect(list.jsonData.currentAnnualReview.eligibleListItems.length).to.equal(6);
  });
});
