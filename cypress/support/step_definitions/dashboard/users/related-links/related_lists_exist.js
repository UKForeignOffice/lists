Given("a related lists exist", () => {
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
      },
      update: {
        type: "funeralDirectors",
        jsonData: { users: ["smoke@cautionyourblast.com"] },
        nextAnnualReviewStartDate: null,
        items: {
          deleteMany: {},
        },
      },
      where: {
        reference: "SMOKE-FD",
      },
    },
  });
});
