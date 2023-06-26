Given("there is a list item unpublished automatically over a year ago", () => {
  cy.task("db", {
    operation: "listItem.create",
    variables: {
      data: {
        type: "lawyers",
        isAnnualReview: false,
        isPublished: false,
        status: "ANNUAL_REVIEW_OVERDUE",
        jsonData: {},
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
              type: "UNPUBLISHED",
              time: new Date("2021-01-01"),
              jsonData: {},
            },
            {
              type: "ANNUAL_REVIEW_OVERDUE",
              time: new Date("2021-01-01"),
              jsonData: {},
            },
          ],
        },
      },
    },
  });
});
