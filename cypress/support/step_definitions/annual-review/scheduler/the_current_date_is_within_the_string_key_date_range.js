import { subDays } from "date-fns";

Given("the current time is within the {string} key date range", function (keyDate) {
  cy.task("db", {
    operation: "list.findFirst",
    variables: {
      where: {
        reference: "SMOKE",
      },
    },
  }).then((list) => {
    const jsonData = list.jsonData;
    const { currentAnnualReview } = jsonData;

    const keyDates = {
      POST_ONE_MONTH: {
        daysBeforeAnnualReview: 28,
        previousKeyDates: [],
      },
      POST_ONE_WEEK: {
        daysBeforeAnnualReview: 7,
        previousKeyDates: ["POST_ONE_MONTH"],
      },
      POST_ONE_DAY: {
        daysBeforeAnnualReview: 1,
        previousKeyDates: ["POST_ONE_MONTH", "POST_ONE_WEEK"],
      },
      START: {
        daysBeforeAnnualReview: 0,
        previousKeyDates: ["POST_ONE_MONTH", "POST_ONE_WEEK", "POST_ONE_DAY"],
      },
    };

    const now = new Date();
    currentAnnualReview.keyDates.annualReview[keyDate] = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0
    ).toISOString();
    keyDates[keyDate].previousKeyDates.forEach((previousKeyDate) => {
      const newKeyDate = subDays(new Date(), keyDates[previousKeyDate].daysBeforeAnnualReview).toISOString();
      currentAnnualReview.keyDates.annualReview[previousKeyDate] = newKeyDate;
    });
    jsonData.currentAnnualReview = currentAnnualReview;

    cy.task("db", {
      operation: "list.update",
      variables: {
        data: {
          jsonData,
        },
        where: {
          reference: "SMOKE",
        },
      },
    });
  });
});
