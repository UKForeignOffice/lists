import { Then } from "@badeball/cypress-cucumber-preprocessor";

import { format } from "date-fns";

Then("A csv file with the name {string} should download", (fileName) => {
  const currentDate = new Date();
  const formattedDate = format(currentDate, "yyyy-MM-dd");
  const downloadsFolder = Cypress.config("downloadsFolder");

  const filename = `${downloadsFolder}/${fileName}-${formattedDate}.csv`;
  cy.readFile(filename, { timeout: 5000 }).should("exist");
});
