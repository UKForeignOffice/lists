import { startOfToday, subYears } from "date-fns";

Given("there is a list item unpublished automatically over a year ago", () => {
  const dateOneYearAgo = subYears(startOfToday(), 1);
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
              time: dateOneYearAgo,
              jsonData: {},
            },
            {
              type: "UNPUBLISHED",
              time: dateOneYearAgo,
              jsonData: {},
            },
          ],
        },
      },
    },
  });
});
