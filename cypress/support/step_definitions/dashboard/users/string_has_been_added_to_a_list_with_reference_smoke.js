When("User {string} has been added to list with reference:SMOKE ", (email) => {
  cy.task("db", {
    operation: "list.upsert",
    variables: {
      create: {
        type: "funeralDirectors",
        reference: "SMOKE",
        nextAnnualReviewStartDate: null,
        jsonData: {},
        country: {
          connect: {
            name: "Eurasia",
          },
        },
        users: {
          connect: { email }
        }
      },
      update: {
        type: "funeralDirectors",
        jsonData: {},
        nextAnnualReviewStartDate: null,
        users: {
          connect: { email }
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
