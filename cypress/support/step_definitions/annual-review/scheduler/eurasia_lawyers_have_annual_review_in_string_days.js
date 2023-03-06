import { randCompanyName, randEmail, randFullName } from "@ngneat/falso";

const today = new Date();

When("eurasia lawyers have annual review in {string} days", async (days = "0") => {
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
      },
    },
  });
}

async function createListItem(reference) {
  const monthAfterToday = today;
  monthAfterToday.setMonth(today.getMonth() - 1);

  return await cy.task("db", {
    operation: "listItem.create",
    variables: {
      data: {
        reference,
        ...createListItemBaseObject(),
        history: {
          createMany: {
            data: [events.PUBLISHED(monthAfterToday)],
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
  PUBLISHED: (date) => ({
    time: date,
    type: "PUBLISHED",
    jsonData: {
      eventName: "publish",
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