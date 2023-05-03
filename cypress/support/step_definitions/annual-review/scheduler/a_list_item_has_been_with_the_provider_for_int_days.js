When("a list item has been with the provider for {int} days", (days) => {
  const publishedDate = new Date();
  publishedDate.setDate(publishedDate.getDate() - days);
  cy.task("db", {
    operation: "listItem.create",
    variables: {
      data: {
        reference: "SCHEDULER_TESTS",
        type: "lawyers",
        isApproved: true,
        isPublished: true,
        isAnnualReview: true,
        isBlocked: false,
        status: "OUT_WITH_PROVIDER",
        jsonData: {
          emailAddress: "test@test.com",
          contactName: "Buster",
        },
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
              type: "PUBLISHED",
              time: publishedDate,
              jsonData: {},
            },
          ],
        },
      },
    },
  });
});
