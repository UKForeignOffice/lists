import { getCommonPersonalisations } from "../govuk-notify.helpers";

afterEach(() => {
  jest.resetAllMocks();
});

test.each`
  listType                     | typeSingular                   | type
  ${"translatorsInterpreters"} | ${"translator or interpreter"} | ${"translators and interpreters"}
  ${"lawyers"}                 | ${"lawyer"}                    | ${"lawyers"}
  ${"funeralDirectors"}        | ${"funeral director"}          | ${"funeral directors"}
`(
  "getCommonPersonalisations returns correct personalisation when listType is $listType",
  ({ listType, typeSingular, type }) => {
    expect(getCommonPersonalisations(listType, "United Kingdom")).toEqual({
      typeSingular,
      type,
      country: "United Kingdom",
    });
  }
);
