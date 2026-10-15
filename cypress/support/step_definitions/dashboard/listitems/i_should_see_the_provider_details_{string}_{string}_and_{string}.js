import { Then } from "@badeball/cypress-cucumber-preprocessor";

Then("I should see the provider details {string}, {string} and {string}", (contactName, companyName, emailAddress) => {
  cy.findByTestId("provider-summary").contains(contactName).contains(companyName).contains(emailAddress);
});
