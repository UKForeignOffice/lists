import { weeklyReminderPersonalisation } from "../weeklyReminderPersonalisation";

describe.each`
  serviceType                  | displayString
  ${"lawyers"}                 | ${"Lawyers"}
  ${"funeralDirectors"}        | ${"Funeral directors"}
  ${"translatorsInterpreters"} | ${"Translator or interpreters"}
`("weeklyReminderPersonalisation for list with type $serviceType", ({ serviceType, displayString }) => {
  test.each`
    weeks | expectedWeekString
    ${1}  | ${"1 week"}
    ${2}  | ${"2 weeks"}
  `("metadata is correct for $weeks weeks", ({ weeks, expectedWeekString }) => {
    const listItem = {
      type: serviceType,
      jsonData: {
        contactName: "Dr. Eggman",
      },
      address: {
        country: {
          name: "United Kingdom",
        },
      },
    };

    expect(
      weeklyReminderPersonalisation(listItem, {
        type: serviceType,
        weeksUntilUnpublish: weeks,
      })
    ).toStrictEqual({
      type: displayString,
      weeksUntilUnpublish: expectedWeekString,
      contactName: "Dr. Eggman",
      country: "United Kingdom",
    });
  });
});
