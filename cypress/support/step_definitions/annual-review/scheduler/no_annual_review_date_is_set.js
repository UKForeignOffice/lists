import { Given } from "@badeball/cypress-cucumber-preprocessor";

Given("no annual review date is set", () => {
  return cy.task("db", {
    operation: "list.update",
    variables: {
      where: {
        reference: "SMOKE",
      },
      data: {
        nextAnnualReviewStartDate: null,
      },
    },
  });
});
