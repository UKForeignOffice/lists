import { addYears, startOfToday, subMonths, subWeeks } from "date-fns";

const today = startOfToday();
const publishedDate = subMonths(today, 1);

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
  const startOfAnnualReview = subWeeks(today, 6);
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
            }
          ],
        },
      },
    },
  });
}

async function createListUnpublishedItem() {
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
              type: "PUBLISHED",
              time: publishedDate,
              jsonData: {},
            }
          ],
        },
      },
    },
  });
}
