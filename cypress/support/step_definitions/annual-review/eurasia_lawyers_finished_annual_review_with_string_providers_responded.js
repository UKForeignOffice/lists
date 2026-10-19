import { When } from "@badeball/cypress-cucumber-preprocessor";

import { addYears, startOfToday, subMonths, subWeeks } from "date-fns";

const today = startOfToday();
const publishedDate = subWeeks(today, 6);

When("eurasia lawyers finished annual review and {string} providers responded", (respondants) => {
  return setAnnualReview().then(() => {
    if (respondants === "all") {
      return createListPublishedItem();
    }
    if (respondants === "some") {
      return createListPublishedItem().then(() => createListUnpublishedItem());
    }
    return createListUnpublishedItem();
  });
});

function setAnnualReview() {
  const startOfAnnualReview = subWeeks(today, 6);
  const yearAfterStartOfAnnualReview = addYears(startOfAnnualReview, 1);

  return cy.task("db", {
    operation: "list.update",
    variables: {
      where: {
        reference: "SMOKE",
      },
      data: { nextAnnualReviewStartDate: yearAfterStartOfAnnualReview, lastAnnualReviewStartDate: startOfAnnualReview },
    },
  });
}

function createListPublishedItem() {
  return cy.task("db", {
    operation: "listItem.create",
    variables: {
      data: {
        type: "lawyers",
        isAnnualReview: false,
        isPublished: true,
        status: "PUBLISHED",
        jsonData: {
          emailAddress: "test@test.com",
          contactName: "Test Published",
          metadata: {
            emailVerified: true,
          },
        },
        reference: "",
        list: {
          connect: {
            reference: "SMOKE",
          },
        },
        address: {
          connect: {
            id: 329,
          },
        },
        history: {
          create: [
            {
              type: "ANNUAL_REVIEW_STARTED",
              time: publishedDate,
              jsonData: {},
            },
            {
              type: "PUBLISHED",
              time: publishedDate,
              jsonData: {},
            },
          ],
        },
      },
    },
  });
}

function createListUnpublishedItem() {
  return cy.task("db", {
    operation: "listItem.create",
    variables: {
      data: {
        type: "lawyers",
        isAnnualReview: false,
        isPublished: false,
        status: "ANNUAL_REVIEW_OVERDUE",
        jsonData: {
          emailAddress: "test@test.com",
          contactName: "Test Unpublished",
          metadata: {
            emailVerified: true,
          },
        },
        reference: "UNPUBLISHED_LIST_ITEM",
        list: {
          connect: {
            reference: "SMOKE",
          },
        },
        address: {
          connect: {
            id: 329,
          },
        },
        history: {
          create: [
            {
              type: "ANNUAL_REVIEW_OVERDUE",
              time: today,
              jsonData: {},
            },
            {
              type: "UNPUBLISHED",
              time: today,
              jsonData: {},
            },
            {
              type: "ANNUAL_REVIEW_STARTED",
              time: publishedDate,
              jsonData: {},
            },
            {
              type: "PUBLISHED",
              time: publishedDate,
              jsonData: {},
            },
          ],
        },
      },
    },
  });
}
