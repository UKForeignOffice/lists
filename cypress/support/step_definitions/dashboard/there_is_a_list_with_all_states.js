/* eslint-disable */
import { rand, randCompanyName, randFullName } from "@ngneat/falso";
import {ListItemEvent} from "@prisma/client";

Given("A {string} list exists for Eurasia", (providerType) => {
  createListForService(providerType);
});

function createListForService(service) {
  const jsonData = {
    administrators: ["smoke@cautionyourblast.com"],
    publishers: ["smoke@cautionyourblast.com"],
    validators: ["smoke@cautionyourblast.com"],
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
        reference: "SMOKE"
      }
    }
  }).then((list) => {
    const listId = list.id;
    const items = itemsFromRows(rows);
    items.forEach(item => {
      createListItem(item, listId)
    })
    addPins(items);
  })
});

function setupPublishEvents(options) {
  let events = [];

  const publishEvent = {
    type: ListItemEvent.PUBLISHED,
    time: new Date('2022-01-01'),
    jsonData: {
      eventName: "publish",
      userId: "smoke",
    }
  }

  if(options.isPublished) {
    events.push(publishEvent)
  }

  if(options.isArchived) {
    console.log("ARCHIVED");
    events.push({
      type: ListItemEvent.ARCHIVED,
      jsonData: {
        eventName: "archived",
        userId: "smoke",
      }
    })
  }

  if(options.jsonData.__smoke.isUnpublishedByUser === true) {
    events.push(publishEvent, {
      type: ListItemEvent.UNPUBLISHED,
      jsonData: {
        eventName: "unpublish",
        userId: "smoke",
      }
    })
  }

  if(options.status === "ANNUAL_REVIEW_OVERDUE") {
    events.push(publishEvent, {
      type: ListItemEvent.UNPUBLISHED,
      jsonData: {
        eventName: "unpublish"
      }
    })
  }

  return events;
}

function listItem(options) {
  const { jsonData,  isPinned, isArchived, status, service, ...rest } = options;
  const events = setupPublishEvents(options);
  const history = {
    create: events
  }
  return {
    type: service,
    jsonData: {
      country: "Eurasia",
      metadata: {
        emailVerified: jsonData.metadata.emailVerified,
      },
      contactName: jsonData.contactName ?? randFullName(),
      declaration: ["confirm"],
      phoneNumber: "1234567",
      emailAddress: jsonData.emailAddress ?? "ignoremyemail@noemail-ignoreme.uk",
      publishEmail: "Yes",
      speakEnglish: true,
      websiteAddress: null,
      organisationName: jsonData.organisationName ?? randCompanyName(),
      representedBritishNationals: true,
      ...jsonData,
    },
    addressId: 329,
    isApproved: false,
    isBlocked: false,
    status,
    ...(events.length && { history }),
    ...rest,
  };
}

const STATUS = [
  "NEW",
  "OUT_WITH_PROVIDER",
  "EDITED",
  "ANNUAL_REVIEW",
  "ANNUAL_REVIEW_OVERDUE",
  "PUBLISHED",
  "UNPUBLISHED",
];

function addPins(items) {
  const shouldPin = items
    .filter((item) => item.jsonData.__smoke.isPinned === true)
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
    const service = row.service ?? "lawyers";
    const updatedAt = row.updatedAt ? new Date(row.updatedAt) : new Date();
    const {
      contactName,
      organisationName,
      emailAddress,
      isPublished: isPublishedString,
      isArchived: isArchivedString,
      isAnnualReview: isAnnualReviewString,
      isPinned,
      displayedRadioButtons,
      hiddenRadioButtons,
      emailVerified,
      city,
      status,
      ...rest
    } = row;

    let isPublished = isPublishedString === "true";
    const isArchived = isArchivedString === "true";
    const isAnnualReview = isAnnualReviewString === "true";


    const baseJsonData = {
      contactName,
      organisationName,
      emailAddress,
      metadata: {
        emailVerified: emailVerified === "true",
      },
      __smoke: {
        isPinned: isPinned === "true",
        displayedRadioButtons: displayedRadioButtons | "",
        hiddenRadioButtons: hiddenRadioButtons | "",
      },
    };

    const jsonDataLawyers = {
      ...baseJsonData,
      areasOfLaw: row.areasOfLaw ?? [],
      size: "Independent lawyer / sole practitioner",
      proBono: true,
      regions: "France and UK",
      legalAid: true,
      emergencyPhoneNumber: null,
      regulators: "Miniluv",
    };

    const jsonDataFuneralDirectors = {
      ...baseJsonData,
      localServicesProvided: ["Local burials", "Flower arrangements", "Exhumations"],
      representedBritishNationals: true,
      repatriationServicesProvided: ["Body repatriation", "Ashes repatriation (from a cremation)"],
    };

    const jsonData = {
      lawyers: jsonDataLawyers,
      funeralDirectors: jsonDataFuneralDirectors,
    };

    const isOverdue = status === "ANNUAL_REVIEW_OVERDUE";

    if(isOverdue) {
      isPublished = false
    }

    return listItem({
      ...rest,
      isPublished,
      isArchived,
      jsonData: jsonData[service],
      updatedAt,
      service,
      status
    });
  });


}

function createListItem(listItem, listId) {
  cy.task("db", {
    operation: "listItem.create",
    variables: {
      data: {
        ...listItem,
        listId
      }
    }
  })
}
