When("a related list exists", () => {
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
          connect: { email: "smoke@cautionyourblast.com" }
        }
      },
      update: {
        type: "funeralDirectors",
        jsonData: { users: ["smoke@cautionyourblast.com"] },
        nextAnnualReviewStartDate: null,
        users: {
          connect: { email: "smoke@cautionyourblast.com" }
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
});
