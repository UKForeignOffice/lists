When("a list item has been edited by the provider {int} days ago", (days) => {
  const publishedDate = new Date();
  publishedDate.setDate(publishedDate.getDate() - days);
  cy.task("db", {
    operation: "listItem.create",
    variables: {
      data: {
        type: "lawyers",
        isApproved: true,
        isPublished: true,
        isAnnualReview: true,
        isBlocked: false,
        status: "EDITED",
        jsonData: {
          emailAddress: "test@test.com",
          contactName: "Buster"
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
