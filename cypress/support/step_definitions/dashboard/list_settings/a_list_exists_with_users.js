Given("a list exists with users", () => {
  const jsonData = {
    users: ["smoke@cautionyourblast.com", "smoke+1@cautionyourblast.com", "smoke+2@cautionyourblast.com"],
  };

  cy.task("db", {
    operation: "list.findUnique",
    variables: {
      where: {
        reference: "SMOKE",
      },
    },
  }).then((result) => {
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
        },
        update: {
          type: "lawyers",
          jsonData: {
            ...result.jsonData,
            ...jsonData,
          },
          items: {
            deleteMany: {},
          },
        },
        where: {
          reference: "SMOKE",
        },
      },
    });
  });
});
