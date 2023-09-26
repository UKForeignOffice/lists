import { format } from "date-fns";
import path from "path";

Then("A csv file with the name {string} should download", (fileName) => {
  const currentDate = new Date();
  const formattedDate = format(currentDate, "yyyy-MM-dd");
  const downloadsFolder = Cypress.config('downloadsFolder');

  const exportLink = cy.findAllByRole("link", {
    name: "Export list as CSV",
  });

  exportLink.invoke('attr', 'download', 'true');
  exportLink.click();

  const filename = path.join(downloadsFolder, `${fileName}-${formattedDate}.csv`)
  cy.readFile(filename, { timeout: 5000 }).should("exist");
});
