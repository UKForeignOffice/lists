import { addYears, startOfToday, subWeeks } from "date-fns";

/* eslint-disable */
When("eurasia lawyers finished annual review and {string} providers responded", async (respondants) => {
  await setAnnualReview();
  if (respondants === "all" || respondants === "some") {
    await createListPublishedItem();
    if (respondants === "some") await createListUnpublishedItem();
  } else {
    await createListUnpublishedItem();
  }
});

async function setAnnualReview() {
  const sixWeeksAgo = subWeeks(startOfToday(), 6);
  const yearAfterSixWeeks = addYears(sixWeeksAgo, 1);

  await cy.task("db", {
    operation: "list.update",
    variables: {
      where: {
        reference: "SMOKE",
      },
      data: { nextAnnualReviewStartDate: yearAfterSixWeeks, lastAnnualReviewStartDate: sixWeeksAgo },
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
        status: "PUBLISHED",
        jsonData: {
          emailAddress: "test@test.com",
          contactName: "Test Published",
          metadata: {
            emailVerified: true,
          },
        },
        reference: "AUTO_DELETE",
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
        reference: "AUTO_DELETE",
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
              time: chosenDate,
              jsonData: {},
            },
            {
              type: "UNPUBLISHED",
              time: chosenDate,
              jsonData: {},
            },
          ],
        },
      },
    },
  });
}
