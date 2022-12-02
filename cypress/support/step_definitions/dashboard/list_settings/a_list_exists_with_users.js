Given("a list exists with users", () => {
  const jsonData = {
    users: ["smoke@cautionyourblast.com", "smoke+1@cautionyourblast.com", "smoke+2@cautionyourblast.com"],
  };

  cy.task("db", {
    operation: "list.upsert",
    variables: {
      create: {
        type: "Lawyers",
        reference: "SMOKE",
        jsonData,
        country: {
          connect: {
            name: "Eurasia",
          },
        },
      },
      update: {
        type: "Lawyers",
        jsonData,
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
