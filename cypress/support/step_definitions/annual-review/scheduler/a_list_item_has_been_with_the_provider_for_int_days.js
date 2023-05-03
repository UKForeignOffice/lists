When("a list item has been with the provider for {int} days with the reference {string}", (days, reference) => {
  const publishedDate = new Date();
  publishedDate.setDate(publishedDate.getDate() - days);

  cy.task("db", {
    operation: "listItem.create",
    variables: {
      data: {
        reference,
        type: "lawyers",
        isApproved: true,
        isPublished: true,
        isAnnualReview: true,
        isBlocked: false,
        status: "OUT_WITH_PROVIDER",
        jsonData: {
          emailAddress: "test@test.com",
          contactName: "Buster",
          metadata: {
            emailVerified: true,
          },
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
