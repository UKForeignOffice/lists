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
   * | contactName | status | isPublished | isBlocked | isApproved | emailVerified
   */
  const rows = table.hashes();

  const items = rows.map((row) => {
    const {
      contactName,
      isPublished: isPublishedString,
      isApproved: isApprovedString,
      isBlocked: isBlockedString,
      emailVerified,
      ...rest
    } = row;

    const isPublished = isPublishedString === "true";
    const isApproved = isApprovedString === "true";
    const isBlocked = isBlockedString === "true";

    const jsonData = {
      contactName,
      metadata: {
        emailVerified: emailVerified === "true",
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
    },
  });
});

function listItem(options) {
  const { jsonData, ...rest } = options;
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
      emailAddress: "ignoremyemail@noemail-ignoreme.uk",
      publishEmail: "Yes",
      speakEnglish: true,
      websiteAddress: null,
      organisationName: randCompanyName(),
      emergencyPhoneNumber: null,
      representedBritishNationals: true,
      ...jsonData,
    },
    addressId: 329,
    isApproved: false,
    isPublished: rand([true, false]),
    isBlocked: false,
    status: rand(status),
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
