import { startOfToday, subMonths } from "date-fns";

Given("there is a list item unpublished automatically {string} a year ago", (timePeriod) => {
  const noOfMonths = timePeriod === "over" ? 12 : 11;
  const chosenDate = subMonths(startOfToday(), noOfMonths);
  cy.task("db", {
    operation: "listItem.create",
    variables: {
      data: {
        type: "lawyers",
        isAnnualReview: false,
        isPublished: false,
        status: "ANNUAL_REVIEW_OVERDUE",
        jsonData: {
          emailAddress: "test@test.com",
          contactName: "AutoDelete",
          metadata: {
            emailVerified: true,
          },
        },
        reference: "AUTO_DELETE",
        list: {
          connect: {
            reference: "SMOKE",
          },
        },
        address: {
          connect: {
            id: 329,
          },
        },
        history: {
          create: [
            {
              type: "ANNUAL_REVIEW_OVERDUE",
              time: chosenDate,
              jsonData: {},
            },
            {
              type: "UNPUBLISHED",
              time: chosenDate,
              jsonData: {},
            },
          ],
        },
      },
    },
  });
});
