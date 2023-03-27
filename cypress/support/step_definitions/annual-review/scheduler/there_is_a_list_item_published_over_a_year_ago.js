Given("there is a list item published over a year ago", () => {
  cy.task("db", {
    operation: "listItem.create",
    variables: {
      data: {
        type: "lawyers",
        isApproved: true,
        isPublished: true,
        isBlocked: false,
        status: "PUBLISHED",
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
              type: "PUBLISHED",
              time: new Date("2021-01-01"),
              jsonData: {},
            },
          ],
        },
      },
    },
  });
});
