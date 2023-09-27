When("User {string} has been added to list with reference:SMOKE", (email) => {
  cy.task("db", {
    operation: "user.upsert",
    variables: {
      create: {
        email,
        jsonData: { roles: [] },
      },
      update: {
        jsonData: { roles: [] },
      },
      where: {
        email,
      },
    },
  }).then(() => {
    cy.task("db", {
      operation: "list.update",
      variables: {
        where: {
          reference: "SMOKE",
        },
        data: {
          users: {
            connect: { email },
          },
        },
      },
    });
  });
});
