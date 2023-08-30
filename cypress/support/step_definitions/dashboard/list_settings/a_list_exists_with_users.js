Given("a list exists with users", async () => {
  const jsonData = {
    users: ["smoke@cautionyourblast.com", "smoke+1@cautionyourblast.com", "smoke+2@cautionyourblast.com"],
  };

  const userIds = await addEmailsToUserTable(jsonData);

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
          jsonData,
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

/**
 *
 * @todo this creates new item in the users table with news ids each time
 */
async function addEmailsToUserTable(emails) {
  const allIDs = [];
  emails.users.forEach(async(email) => {
    await cy.task("db", {
      operation: "user.upsert",
      variables: {
        create: {
          email,
          jsonData: {
            roles: []
          }
        },
        update: {
          jsonData: {
            roles: []
          }
        },
        where: {
          email,
        },
      },
    }).then(result => {
      allIDs.push({id: result.id})
    });
  });
  return allIDs;
}