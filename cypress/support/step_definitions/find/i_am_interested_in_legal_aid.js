import { When } from "@badeball/cypress-cucumber-preprocessor";

When("I am {}interested in legal aid", (interest) => {
  const isInterested = !interest;
  cy.findByText(isInterested ? "Yes" : "No").click();
  cy.findByRole("button").click();
});
