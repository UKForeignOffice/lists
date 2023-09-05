Given("the following user has been added to a list {string}", (userEmail) => {
  cy.task("db", {
    operation: "user.findUnique",
    variables: {
      where: {
        email: userEmail,
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
          jsonData: {},
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
          jsonData: {},
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
