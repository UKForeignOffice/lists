import { weeklyReminderPersonalisation } from "../weeklyReminderPersonalisation";

describe.each`
  serviceType                  | displayString
  ${"lawyers"}                 | ${"Lawyers"}
  ${"funeralDirectors"}        | ${"Funeral directors"}
  ${"translatorsInterpreters"} | ${"Translator or interpreters"}
`("weeklyReminderPersonalisation for list with type $serviceType", ({ serviceType, displayString }) => {
  test.each`
    weeks |
    ${1}
    ${2}
  `("metadata is correct for $weeks weeks", ({ weeks }) => {
    const listItem = {
      reference: "344M4N",
      type: serviceType,
      jsonData: {
        contactName: "Dr. Eggman",
      },
    };

    expect(
      weeklyReminderPersonalisation(listItem, {
        type: serviceType,
        weeksUntilUnpublish: weeks,
        countryName: "United Kingdom",
        parsedUnpublishDate: "15 March 2023",
      })
    ).toStrictEqual({
      typePlural: displayString,
      contactName: "Dr. Eggman",
      country: "United Kingdom",
      deletionDate: "15 March 2023",
      changeLink: "https://test-domain/annual-review/confirm/344M4N",
    });
  });
});
