import { rand, randCompanyName, randFullName } from "@ngneat/falso";

Given("A lawyers list exists for Eurasia", () => {
  const jsonData = {
    administrators: ["smoke@cautionyourblast.com"],
  };
  cy.task("db", {
    operation: "list.upsert",
    variables: {
      create: {
        type: "lawyer",
        jsonData,
        country: {
          connect: {
            id: 1,
          },
        },
      },
      update: {
        jsonData,
      },
      where: {
        id: 1984,
      },
    },
  });
});

Given("a {string} list item exists", () => {
  const jsonData = {
    administrators: ["smoke@cautionyourblast.com"],
  };
  cy.task("db", {
    operation: "list.upsert",
    variables: {
      create: {
        id: 1984,
        jsonData,
      },
      update: {
        jsonData,
      },
      where: {
        id: 1984,
      },
    },
  });
});

Given("there are these list items", (table) => {
  /**
   * | contactName | status | isPublished | isBlocked | isApproved
   */
  const rows = table.hashes();

  rows.forEach((row) => {
    const {
      contactName,
      isPublished: isPublishedString,
      isApproved: isApprovedString,
      isBlocked: isBlockedString,
      ...rest
    } = row;

    const isPublished = Boolean(isPublishedString);
    const isApproved = Boolean(isApprovedString);
    const isBlocked = Boolean(isBlockedString);

    const jsonData = {
      contactName,
    };
    const item = listItem({
      ...rest,
      isPublished,
      isApproved,
      isBlocked,
      jsonData,
    });

    cy.task("db", {
      operation: "listItem.upsert",
      variables: {
        create: item,
        update: item,
        where: {
          id: 1984,
        },
      },
    });
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
      metadata: [],
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
    listId: 1984,
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

function listItems(numberOfItems) {
  return new Array(numberOfItems).map(() => listItem());
}
