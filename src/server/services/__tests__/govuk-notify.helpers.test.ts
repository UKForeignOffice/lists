import { getNotifyClient } from "../../../shared/getNotifyClient";
import { sendEmails } from "../govuk-notify";
import { getCommonPersonalisations } from "../govuk-notify.helpers";

afterEach(() => {
  jest.resetAllMocks();
});
test("sendEmails calls sendEmail the correct amount of times", async () => {
  const notifyClient = getNotifyClient();
  const spy = jest.spyOn(notifyClient, "sendEmail");

  await sendEmails("abc", ["test@gov.uk", "test@gov.uk"], {});

  expect(spy).toBeCalledTimes(2);
});

test("sendEmails only rejects when all emails fail", async () => {
  const notifyClient = getNotifyClient();
  const spy = jest.spyOn(notifyClient, "sendEmail");
  spy.mockRejectedValue("Error");
  await expect(sendEmails("abc", ["test@gov.uk", "test@gov.uk"], {})).rejects.toThrow(AggregateError);
});

test("sendEmails returns resolved value when at least one email sends", async () => {
  const notifyClient = getNotifyClient();
  const spy = jest.spyOn(notifyClient, "sendEmail");
  spy.mockResolvedValueOnce({ successText: "woo" }).mockRejectedValue("Error");

  expect(await sendEmails("abc", ["test@gov.uk", "test@gov.uk"], {})).toEqual({ successText: "woo" });
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
