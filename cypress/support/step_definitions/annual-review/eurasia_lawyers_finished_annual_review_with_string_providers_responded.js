import { addYears, startOfToday, subWeeks } from "date-fns";

const startOfAnnualReview = subWeeks(startOfToday(), 6);
/* eslint-disable */
When("eurasia lawyers finished annual review and {string} providers responded", async (respondants) => {
  await setAnnualReview();

  if (respondants === "all") {
    await createListPublishedItem();
  } else if (respondants === "some") {
    await createListPublishedItem();
    await createListUnpublishedItem();
  } else {
    await createListUnpublishedItem();
  }
});

async function setAnnualReview() {

  const yearAfterStartOfAnnualReview = addYears(startOfAnnualReview, 1);

  await cy.task("db", {
    operation: "list.update",
    variables: {
      where: {
        reference: "SMOKE",
      },
      data: { nextAnnualReviewStartDate: yearAfterStartOfAnnualReview, lastAnnualReviewStartDate: startOfAnnualReview },
    },
  });
}

async function createListPublishedItem() {
  await cy.task("db", {
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
      },
    },
  });
}

async function createListPublishedItem() {
  await cy.task("db", {
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
              type: "ANNUAL_REVIEW_OVERDUE",
              time: startOfAnnualReview,
              jsonData: {},
            },
            {
              type: "UNPUBLISHED",
              time: startOfAnnualReview,
              jsonData: {},
            },
          ],
        },
      },
    },
  });
}
