Given("Some fields have been updated for {string}", (contactName) => {
  cy.task("db", {
    operation: "listItem.findFirst",
    variables: {
      where: {
        jsonData: {
          path: ["contactName"],
          equals: contactName,
        },
      },
    },
  }).then((result) => {
    cy.task("db", {
      operation: "listItem.update",
      variables: {
        where: {
          id: result.id,
        },
        data: {
          jsonData: {
            ...result.jsonData,
            updatedJsonData: {
              proBono: false,
              organisationName: "Oldman Law",
            },
          },
        },
      },
    });
  });
});
