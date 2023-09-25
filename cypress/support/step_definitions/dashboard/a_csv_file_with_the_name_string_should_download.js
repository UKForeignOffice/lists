import { format } from "date-fns";
import path from "path";

Then("A csv file with the name {string} should download", (fileName) => {
  // const currentDate = new Date();
  // const formattedDate = format(currentDate, "yyyy-MM-dd");
  // const downloadsFolder = Cypress.config('downloadsFolder');

  // const filename = path.join(downloadsFolder, `${fileName}-${formattedDate}.csv`)
  // cy.readFile(filename, { timeout: 15000 }).should("exist");

  // cy.reload(true, {timeout: 5000});


  cy.intercept({ method: 'GET', url: '/dashboard/lists/634/csv' }, (req) => {
    req.reply({
      statusCode: 200,
    });
  }).as('responseRole');

  cy.findAllByRole("link", {
    name: "Export list as CSV",
  }).click(true);


  cy.wait('@responseRole').then(({response}) => {
    cy.log(response);
    expect(response).to.include('attachment; filename=Eurasia-Lawyers-2023-09-25.csv')

  });
});
