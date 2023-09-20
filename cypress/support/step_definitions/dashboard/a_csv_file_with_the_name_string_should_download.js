import { format } from "date-fns";
import path from "path";

Then("A csv file with the name {string} should download", (fileName) => {
  const currentDate = new Date();
  const formattedDate = format(currentDate, "yyyy-MM-dd");
  const downloadsFolder = Cypress.config('downloadsFolder')

  const filename = path.join(downloadsFolder, `${fileName}-${formattedDate}.csv`)
  cy.readFile(filename, { timeout: 15000 }).should("exist");
});
