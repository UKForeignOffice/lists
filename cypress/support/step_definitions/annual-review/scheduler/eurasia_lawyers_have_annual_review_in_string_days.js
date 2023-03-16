import { randCompanyName, randEmail, randFullName } from "@ngneat/falso";

When("eurasia lawyers have annual review in {string} days", async (days = "0") => {
  const today = new Date();
  await updateListForAnnualReview(days, today);

  ["user1", "user2"].forEach(async (reference) => {
    await createListItem(reference, today);
  });
});

async function updateListForAnnualReview(days, today) {
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

async function createListItem(reference, today) {
  const monthBeforeToday = today;
  monthBeforeToday.setMonth(today.getMonth() - 1);

  return await cy.task("db", {
    operation: "listItem.create",
    variables: {
      data: {
        reference,
        ...createListItemBaseObject(reference),
        history: {
          createMany: {
            data: [events.PUBLISHED(monthBeforeToday), events.OUT_WITH_PROVIDER(monthBeforeToday)],
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
  OUT_WITH_PROVIDER: (date) => ({
    time: date,
    type: "OUT_WITH_PROVIDER",
    jsonData: {
      eventName: "out with provider",
    },
  }),
  PUBLISHED: (date) => ({
    time: date,
    type: "PUBLISHED",
    jsonData: {
      eventName: "publish",
    },
  }),
};

function createListItemBaseObject(reference) {
  return {
    type: "lawyers",
    isApproved: true,
    isPublished: true,
    isBlocked: false,
    isAnnualReview: reference !== "user1",
    status: reference === "user1" ? "PUBLISHED" : "OUT_WITH_PROVIDER",
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
