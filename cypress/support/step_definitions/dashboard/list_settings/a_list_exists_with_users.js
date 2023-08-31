Given("a list exists with users", async () => {
  const userIds = getIdsForUsersWithSmokeEmail();

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
            connect: userIds
          }
        },
        update: {
          type: "lawyers",
          items: {
            deleteMany: {},
          },
          users: {
            connect: userIds
          }
        },
        where: {
          reference: "SMOKE",
        },
      },
    });
  });
});


function getIdsForUsersWithSmokeEmail() {
  let allIDs = [];
  cy.task("db", {
    operation: "user.findMany",
    variables: {
      where: {
        email: {
          contains: "smoke"
        },
      },
    },
  }).then(results => {
    allIDs = results.reduce((acc, result) => [...acc, {id: result.id}], []);
  });
  return allIDs;
}