Given("a list exists with users", async () => {
  const emails = [{ email: 'smoke@cautionyourblast.com' }, { email: 'smoke+1@cautionyourblast.com' }, { email: 'smoke+2@cautionyourblast.com' }];

  cy.task("db", {
    operation: "list.findUnique",
    variables: {
      where: {
        reference: "SMOKE",
      },
    },
  }).then(() => {
    cy.task("db", {
      operation: "list.upsert",
      variables: {
        create: {
          type: "lawyers",
          reference: "SMOKE",
          jsonData: {},
          country: {
            connect: {
              name: "Eurasia",
            },
          },
          users: {
            connect: emails
          }
        },
        update: {
          type: "lawyers",
          items: {
            deleteMany: {},
          },
          users: {
            connect: emails
          }
        },
        where: {
          reference: "SMOKE",
        },
      },
    });
  });
});