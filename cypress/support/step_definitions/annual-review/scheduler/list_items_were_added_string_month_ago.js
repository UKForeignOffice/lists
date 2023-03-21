import { randCompanyName, randEmail, randFullName } from "@ngneat/falso";


And("list items were added {string} months ago", async (monthsAgo = "0") => {
  ["user1", "user2"].forEach(async (reference) => {
    await createListItem(reference, monthsAgo);
  });
});

async function createListItem(reference, monthsAgo) {
  const today = new Date();
  const monthsBeforeToday = today;

  monthsBeforeToday.setMonth(today.getMonth() - Number(monthsAgo));
  cy.log(monthsBeforeToday)

  return await cy.task("db", {
    operation: "listItem.create",
    variables: {
      data: {
        reference,
        ...createListItemBaseObject(reference),
        history: {
          createMany: {
            data: [events.PUBLISHED(monthsBeforeToday), events.OUT_WITH_PROVIDER(monthsBeforeToday)],
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