/* eslint-disable */
import { rand, randCompanyName, randFullName } from "@ngneat/falso";

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
   * | contactName | companyName | status | isPublished | isBlocked | isApproved | emailVerified | isPinned | displayedRadioButtons | hiddenRadioButtons | service?
   */
  const rows = table.hashes();

  const items = rows.map((row) => {
    const service = row.service ?? "lawyers";
    const createdAt = row.updatedAt ? new Date(row.updatedAt) : new Date();
    const {
      contactName,
      organisationName,
      emailAddress,
      isPublished: isPublishedString,
      isApproved: isApprovedString,
      isBlocked: isBlockedString,
      isPinned,
      displayedRadioButtons,
      hiddenRadioButtons,
      emailVerified,
      city,
      ...rest
    } = row;

    const isPublished = isPublishedString === "true";
    const isApproved = isApprovedString === "true";
    const isBlocked = isBlockedString === "true";

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

    return listItem({
      ...rest,
      isPublished,
      isApproved,
      isBlocked,
      jsonData: jsonData[service],
      updatedAt,
      service,
    });
  });
  cy.task("db", {
    operation: "list.update",
    variables: {
      data: {
        items: {
          createMany: { data: items, skipDuplicates: true },
        },
      },
      where: {
        reference: "SMOKE",
      },
      select: {
        items: true,
      },
    },
  }).then((updatedList) => {
    const shouldPin = updatedList.items
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
  });
});

function listItem(options) {
  const { jsonData, status, isPinned, service, ...rest } = options;

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
    isPublished: rand([true, false]),
    isBlocked: false,
    status: status ?? rand(status),
    ...rest,
  };
}

const status = [
  "NEW",
  "OUT_WITH_PROVIDER",
  "EDITED",
  "ANNUAL_REVIEW",
  "REVIEW_OVERDUE",
  "REVIEWED",
  "PUBLISHED",
  "UNPUBLISHED",
];
