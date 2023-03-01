import { randCompanyName, randEmail, randFullName } from "@ngneat/falso";

const today = new Date();

Given("eurasia lawyers have annual review in {string} days", async (days = "0") => {
  await updateListForAnnualReview(days);
  await createListItem("test-user");
});

async function updateListForAnnualReview(days) {
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
        jsonData: {
          users: ["smoke@cautionyourblast.com"],
          currentAnnualReview: {
            keyDates: {
              unpublished: {
                PROVIDER_FIVE_WEEKS: "2023-04-04T00:00:00.000Z",
              },
              annualReview: {
                START: todayAfternoon.toISOString(),
              },
            },
          },
        },
      },
    },
  });
}

async function createListItem(reference) {
  const monthAfterToday = today;
  monthAfterToday.setMonth(today.getMonth() + 1);

  return await cy.task("db", {
    operation: "listItem.create",
    variables: {
      data: {
        reference,
        ...createListItemBaseObject(),
        history: {
          createMany: {
            data: [events.NEW(monthAfterToday)],
          },
        },
        address: {
          create: {
            firstLine: "ref",
            country: {
              connect: {
                name: "Eurasia",
              },
            },
          },
        },
      },
    },
  });
}

const events = {
  NEW: (date) => ({
    time: date,
    type: "ANNUAL_REVIEW_STARTED",
    jsonData: {
      eventName: "new",
    },
  }),
};

function createListItemBaseObject() {
  return {
    type: "lawyers",
    isApproved: true,
    isPublished: true,
    isBlocked: false,
    status: "PUBLISHED",
    jsonData: createLawyersJsonData(),
    list: {
      connect: {
        reference: "SMOKE",
      },
    },
  };
}

function createLawyersJsonData() {
  return {
    country: "Eurasia",
    contactName: randFullName(),
    organisationName: randCompanyName(),
    emailAddress: randEmail(),
    speakEnglish: true,
    websiteAddress: null,
    regions: "France and UK",
    phoneNumber: "1234567",
    declaration: ["confirm"],
    publishEmail: "Yes",
    regulators: "Miniluv",
    emergencyPhoneNumber: null,
    representedBritishNationals: true,
    metadata: {
      emailVerified: true,
    },
    areasOfLaw: [],
    size: "Independent lawyer / sole practitioner",
    proBono: true,
    legalAid: true,
  };
}
