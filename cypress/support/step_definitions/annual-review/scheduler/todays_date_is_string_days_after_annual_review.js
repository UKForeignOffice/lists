import { addDays, startOfDay, subDays } from "date-fns";

And("todays date is {string} days after annual review", (date) => {
  const currentDate = new Date();
  const futureDate = addDays(currentDate, date);

  cy.clock(futureDate.getTime());
  cy.stub(Date, 'now').returns(futureDate.getTime());
});
