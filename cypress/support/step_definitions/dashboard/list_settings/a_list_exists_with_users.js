Given("a list exists with users", async () => {
  const emails = [{ email: 'simulate-delivered@notifications.service.gov.uk' }, { email: 'simulate-delivered+1@notifications.service.gov.uk' }, { email: 'simulate-delivered+2@notifications.service.gov.uk' }];

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