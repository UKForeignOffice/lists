Given("a related lists exist", () => {
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
          items: {
            deleteMany: {},
          },
          users: {
            connect: { id: result.id }
          }
        },
        where: {
          reference: "SMOKE-FD",
        },
      },
    });
  })

});
