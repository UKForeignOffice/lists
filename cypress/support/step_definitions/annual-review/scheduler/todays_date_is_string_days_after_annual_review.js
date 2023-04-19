import { addDays, startOfDay } from "date-fns";

And("todays date is {string} days after annual review", async (date) => {
  const currentDate = new Date();
  const futureDate = startOfDay(addDays(currentDate, date));

  await cy.task("worker", {futureDate: futureDate.getTime()});
});
