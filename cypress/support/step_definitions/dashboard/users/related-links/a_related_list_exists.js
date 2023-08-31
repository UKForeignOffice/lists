When("a related list exists", () => {
  cy.task("db", {
    operation: "user.findUnique",
    variables: {
      where: {
        email: "smoke@cautionyourblast.com",
      },
    },
  }).then(result => {
    cy.task("db", {
      operation: "list.upsert",
      variables: {
        create: {
          type: "funeralDirectors",
          reference: "SMOKE-FD",
          nextAnnualReviewStartDate: null,
          jsonData: { users: ["smoke@cautionyourblast.com"] },
          country: {
            connect: {
              name: "Eurasia",
            },
          },
          users: {
            connect: { id: result.id }
          }
        },
        update: {
          type: "funeralDirectors",
          jsonData: { users: ["smoke@cautionyourblast.com"] },
          nextAnnualReviewStartDate: null,
          users: {
            connect: { id: result.id }
          },
          items: {
            deleteMany: {},
          },
        },
        where: {
          reference: "SMOKE-FD",
        },
      },
    });
  })
});
