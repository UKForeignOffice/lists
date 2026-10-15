import { When } from "@badeball/cypress-cucumber-preprocessor";

When("I am {}interested in pro bono", (not) => {
  const isInterested = !not;
  cy.findByRole("radio", { name: isInterested ? "Yes" : "No" }).click();
  cy.findByRole("button").click();
});
