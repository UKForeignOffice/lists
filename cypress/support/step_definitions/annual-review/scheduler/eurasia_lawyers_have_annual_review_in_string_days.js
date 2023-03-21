When("eurasia lawyers have annual review in {string} days", async (days = "0") => {
  await updateListForAnnualReview(days);
});

async function updateListForAnnualReview(days) {
  const today = new Date();
  const todayAfternoon = new Date(
    today.getUTCFullYear(),
    today.getUTCMonth(),
    today.getDate() + Number(days),
    12,
    0,
    0
  );

  await cy.task("db", {
    operation: "list.update",
    variables: {
      where: {
        reference: "SMOKE",
      },
      data: {
        nextAnnualReviewStartDate: todayAfternoon,
      },
    },
  });
}
