/* eslint-disable */
import { rand, randCompanyName, randEmail, randFullName } from "@ngneat/falso";
import { ListItemEvent } from "@prisma/client";

Given("A {string} list exists for Eurasia", (providerType) => {
  createListForService(providerType);
});

function createListForService(service) {
  const jsonData = {
    users: ["smoke@cautionyourblast.com"],
    annualReviewStartDate: "2022-01-01T00:00:00.000Z",
  };
  cy.task("db", {
    operation: "country.upsert",
    variables: {
      create: {
        name: "Eurasia",
      },
      update: {},
      where: {
        name: "Eurasia",
      },
    },
  });

  cy.task("db", {
    operation: "event.deleteMany",
    variables: {
      where: {
        listItem: {
          list: {
            reference: "SMOKE",
          },
        },
      },
    },
  });

  cy.task("db", {
    operation: "list.upsert",
    variables: {
      create: {
        type: service,
        reference: "SMOKE",
        jsonData,
        country: {
          connect: {
            name: "Eurasia",
          },
        },
      },
      update: {
        type: service,
        jsonData,
        items: {
          deleteMany: {},
        },
      },
      where: {
        reference: "SMOKE",
      },
    },
  });
}

Given("there are these list items", (table) => {
  /**
   * | contactName | companyName | status | isPublished |  emailVerified | isPinned | displayedRadioButtons | hiddenRadioButtons | service | isArchived
   */
  const rows = table.hashes();

  cy.task("db", {
    operation: "list.findUnique",
    variables: {
      where: {
        reference: "SMOKE",
      },
    },
  }).then((list) => {
    const listId = list.id;
    const items = itemsFromRows(rows);
    items.forEach((item) => {
      createListItem(item, listId);
    });
  });

  cy.task("db", {
    operation: "list.findUnique",
    variables: {
      where: {
        reference: "SMOKE",
      },
      include: {
        items: true,
      },
    },
  }).then((list) => {
    const listId = list.id;
    const { items } = list;
    addPins(items);
  });
});

function setupPublishEvents(options) {
  const events = [];

  const publishEvent = {
    type: ListItemEvent.PUBLISHED,
    time: new Date("2022-01-01"),
    jsonData: {
      eventName: "publish",
      userId: "smoke",
    },
  };

  if (options.isPublished) {
    events.push(publishEvent);
  }

  if (options.isArchived) {
    events.push({
      type: ListItemEvent.ARCHIVED,
      jsonData: {
        eventName: "archived",
        userId: "smoke",
      },
    });
  }

  if (options.__smoke.isUnpublishedByUser === true) {
    events.push(publishEvent, {
      type: ListItemEvent.UNPUBLISHED,
      jsonData: {
        eventName: "unpublish",
        userId: "smoke",
      },
    });
  }

  if (options.status === "ANNUAL_REVIEW_OVERDUE") {
    events.push(publishEvent, {
      type: ListItemEvent.UNPUBLISHED,
      jsonData: {
        eventName: "unpublish",
      },
    });
  }

  return events;
}

function listItem(options) {
  const { isArchived, emailVerified = true, isPublished, service = "lawyers", __smoke, ...rest } = options;

  const events = setupPublishEvents(options);
  const history = {
    create: events,
  };

  let status = options.status;

  const jsonData = {
    ...JSON_DATA[service](),
    ...rest,
    __smoke,
    metadata: {
      emailVerified,
    },
  };

  const updatedAt = options.updatedAt && new Date(options.updatedAt);

  return {
    ...(updatedAt && { updatedAt }),
    status,
    isPublished,
    type: service,
    jsonData,
    addressId: 329,
    ...(events.length && { history }),
  };
}

const STATUS = [
  "NEW",
  "OUT_WITH_PROVIDER",
  "EDITED",
  "ANNUAL_REVIEW",
  "ANNUAL_REVIEW_OVERDUE",
  "CHECK_ANNUAL_REVIEW",
  "PUBLISHED",
  "UNPUBLISHED",
];

function addPins(items) {
  const shouldPin = items
    .filter((item) => item.jsonData.__smoke?.isPinned === true)
    .map((item) => ({
      id: item.id,
    }));

  cy.task("db", {
    operation: "user.update",
    variables: {
      data: {
        pinnedItems: {
          set: shouldPin,
        },
      },
      where: {
        email: "smoke@cautionyourblast.com",
      },
    },
  });
}

function itemsFromRows(rows) {
  return rows.map((row) => {
    const {
      // ONLY destructure here so you can cast booleans. The ...REST of the parameters will be passed to list items.
      isPublished: isPublishedString,
      isArchived: isArchivedString,
      isAnnualReview: isAnnualReviewString,
      isPinned: isPinnedString,
      ...rest
    } = row;

    let isPublished = isPublishedString === "true";
    const isArchived = isArchivedString === "true";
    const isAnnualReview = isAnnualReviewString === "true";
    const isPinned = isPinnedString === "true";

    const __smoke = {
      isPinned,
      isUnpublishedByUser: row.isUnpublishedByUser === "true",
    };

    if (row.status === "ANNUAL_REVIEW_OVERDUE") {
      isPublished = false;
    }

    return listItem({
      ...rest,
      isPublished,
      isArchived,
      emailVerified: row.emailVerified !== "false", // default to TRUE for ease (i.e. only explicitly set to false when needed).
      __smoke,
    });
  });
}

function createListItem(listItem, listId) {
  cy.task("db", {
    operation: "listItem.create",
    variables: {
      data: {
        ...listItem,
        listId,
      },
    },
  });
}

//DO NOT CHANGE so this accepts parameters.
//This is just used to generate base json data.
const baseJsonData = () => ({
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
  __smoke: {
    isPinned: false,
  },
});

const jsonDataLawyers = () => ({
  ...baseJsonData(),
  areasOfLaw: [],
  size: "Independent lawyer / sole practitioner",
  proBono: true,
  legalAid: true,
});

const jsonDataFuneralDirectors = () => ({
  ...baseJsonData(),
  localServicesProvided: ["Local burials", "Flower arrangements", "Exhumations"],
  representedBritishNationals: true,
  repatriationServicesProvided: ["Body repatriation", "Ashes repatriation (from a cremation)"],
});

const JSON_DATA = {
  lawyers: () => jsonDataLawyers(),
  funeralDirectors: () => jsonDataFuneralDirectors(),
};
