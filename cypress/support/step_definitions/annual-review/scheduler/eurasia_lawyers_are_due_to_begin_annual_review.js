import { randCompanyName, randEmail, randFullName } from "@ngneat/falso";

Given("eurasia lawyers are due to begin annual review", async () => {
  await setAnnualReview();
  await createEligible();
  await createIneligible();
});

async function createEligible() {
  const eligibleReferences = ["eligible-1", "eligible-2", "eligible-3", "eligible-4", "eligible-5"];

  eligibleReferences.forEach(async (reference) => {
    createEligibleListItem(reference);
  });
}

async function createIneligible() {
  await createNew();
  await createRepublishedRecently();
}

async function setAnnualReview() {
  const today = new Date();
  const fourWeeksAway = new Date(today.getUTCFullYear(), today.getUTCMonth(), today.getDate() + 28);

  await cy.task("db", {
    operation: "list.update",
    variables: {
      where: {
        reference: "SMOKE",
      },
      data: { nextAnnualReviewStartDate: fourWeeksAway },
    },
  });
}

async function createNew() {
  const reference = "ineligible-1";
  await cy.task("db", {
    operation: "listItem.create",
    variables: {
      data: {
        reference,
        isPublished: false,
        ...listItemCreateBaseObject(),
        history: {
          createMany: {
            data: [
              {
                type: "NEW",
                jsonData: {
                  eventName: "new",
                },
              },
            ],
          },
        },
        address: {
          create: {
            firstLine: reference,
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

async function createRepublishedRecently() {
  const reference = "ineligible-2";
  const unpublishDate = new Date();
  unpublishDate.setDate(unpublishDate.getDate() - 15);

  return await cy.task("db", {
    operation: "listItem.create",
    variables: {
      data: {
        reference,
        isPublished: true,
        ...listItemCreateBaseObject(),
        history: {
          createMany: {
            data: [events.NEW(), events.PUBLISHED(), events.UNPUBLISHED(unpublishDate), events.PUBLISHED(new Date())],
          },
        },
        address: {
          create: {
            firstLine: reference,
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

async function createEligibleListItem(reference) {
  return await cy.task("db", {
    operation: "listItem.create",
    variables: {
      data: {
        reference,
        ...listItemCreateBaseObject(),
        history: {
          createMany: {
            data: [events.NEW(), events.PUBLISHED()],
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

const dateNineMonthsAgo = new Date();
dateNineMonthsAgo.setMonth(-8);

const dateTenMonthsAgo = new Date();
dateTenMonthsAgo.setMonth(-9);

const events = {
  NEW: function (date = dateTenMonthsAgo) {
    return {
      time: date,
      type: "NEW",
      jsonData: {
        eventName: "new",
      },
    };
  },
  PUBLISHED: function (date = dateNineMonthsAgo) {
    return {
      type: "PUBLISHED",
      time: date,
      jsonData: {
        eventName: "publish",
      },
    };
  },
  UNPUBLISHED: function (date = dateNineMonthsAgo) {
    return {
      type: "UNPUBLISHED",
      time: date,
      jsonData: {
        eventName: "unpublish",
      },
    };
  },
};

// DO NOT CHANGE so this accepts parameters.
// This is just used to generate base json data.
async function baseJsonData() {
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
  };
}
function jsonDataLawyers() {
  return {
    ...baseJsonData(),
    areasOfLaw: [],
    size: "Independent lawyer / sole practitioner",
    proBono: true,
    legalAid: true,
  };
}
function listItemCreateBaseObject() {
  return {
    type: "lawyers",
    isApproved: true,
    isPublished: true,
    isBlocked: false,
    status: "PUBLISHED",
    jsonData: jsonDataLawyers(),
    list: {
      connect: {
        reference: "SMOKE",
      },
    },
  };
}
