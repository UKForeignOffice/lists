Given("the provider with reference {string} has edited their details", function (reference) {
  cy.task("db", {
    operation: "listItem.update",
    variables: {
      where: {
        reference,
      },
      data: {
        isBlocked: false,
        status: "CHECK_ANNUAL_REVIEW",
        history: {
          create: [
            {
              type: "CHECK_ANNUAL_REVIEW",
              time: new Date().toISOString(),
              jsonData: {},
            },
          ],
        },
      },
    },
  });
});
