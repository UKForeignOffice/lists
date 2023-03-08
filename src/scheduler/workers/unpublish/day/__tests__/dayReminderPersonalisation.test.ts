import { postReminderPersonalisation, providerReminderPersonalisation } from "../dayReminderPersonalisation";

describe.each`
  serviceType                  | displayString
  ${"lawyers"}                 | ${"Lawyers"}
  ${"funeralDirectors"}        | ${"Funeral directors"}
  ${"translatorsInterpreters"} | ${"Translator or interpreters"}
`("dayBeforeReminderPersonalisation for list with type $serviceType", ({ serviceType, displayString }) => {
  test.each([1, 2])("metadata is correct for post", () => {
    const listItem = {
      reference: "344M4N",
      type: serviceType,
      jsonData: {
        contactName: "Dr. Eggman",
      },
    };

    const numberNotResponded = 5;

    expect(
      postReminderPersonalisation(listItem, numberNotResponded, {
        type: serviceType,
        countryName: "United Kingdom",
        parsedUnpublishDate: "15 March 2023",
      })
    ).toStrictEqual({
      typePlural: displayString,
      typePluralCapitalised: displayString.toUpperCase(),
      country: "United Kingdom",
      numberNotResponded,
    });
  });

  test.each([1, 2])("metadata is correct for providers", () => {
    const listItem = {
      reference: "344M4N",
      type: serviceType,
      jsonData: {
        contactName: "Dr. Eggman",
      },
    };

    expect(
      providerReminderPersonalisation(listItem, {
        type: serviceType,
        countryName: "United Kingdom",
        parsedUnpublishDate: "15 March 2023",
      })
    ).toStrictEqual({
      typePlural: displayString,
      contactName: listItem.jsonData.contactName,
      country: "United Kingdom",
    });
  });
});
