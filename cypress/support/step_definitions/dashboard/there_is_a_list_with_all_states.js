import { rand, randCompanyName, randFullName } from "@ngneat/falso";

Given("A lawyers list exists for Eurasia", () => {
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
        type: "lawyers",
        reference: "SMOKE",
        jsonData,
        country: {
          connect: {
            name: "Eurasia",
          },
        },
      },
      update: {
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
});

Given("there are these list items", (table) => {
  /**
   * | contactName | companyName | status | isPublished | isBlocked | isApproved | emailVerified | isPinned | displayedRadioButtons | hiddenRadioButtons
   */
  const rows = table.hashes();

  const items = rows.map((row) => {
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
      areasOfLaw,
      ...rest
    } = row;

    const isPublished = isPublishedString === "true";
    const isApproved = isApprovedString === "true";
    const isBlocked = isBlockedString === "true";

    const jsonData = {
      contactName,
      organisationName,
      emailAddress,
      areasOfLaw,
      metadata: {
        emailVerified: emailVerified === "true",
      },
      __smoke: {
        isPinned: isPinned === "true",
        displayedRadioButtons: displayedRadioButtons | "",
        hiddenRadioButtons: hiddenRadioButtons | "",
      },
    };

    return listItem({
      ...rest,
      isPublished,
      isApproved,
      isBlocked,
      jsonData,
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
  const { jsonData, status, isPinned, ...rest } = options;

  return {
    type: "lawyers",
    jsonData: {
      size: "Independent lawyer / sole practitioner",
      country: "Eurasia",
      proBono: true,
      regions: "France and UK",
      legalAid: true,
      metadata: {
        emailVerified: jsonData.metadata.emailVerified,
      },
      areasOfLaw: [],
      regulators: "Miniluv",
      contactName: jsonData.contactName ?? randFullName(),
      declaration: [],
      phoneNumber: "",
      emailAddress:
        jsonData.emailAddress ?? "ignoremyemail@noemail-ignoreme.uk",
      publishEmail: "Yes",
      speakEnglish: true,
      websiteAddress: null,
      organisationName: jsonData.organisationName ?? randCompanyName(),
      emergencyPhoneNumber: null,
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
