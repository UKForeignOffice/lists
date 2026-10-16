import { formRunnerPostRequestSchema } from "../schemas";

describe("formRunnerPostRequestSchema", () => {
  test.each([null, "", false, ["option one", "option two"]])("accepts %p as a form answer", (answer) => {
    const result = formRunnerPostRequestSchema.validate({
      questions: [{ fields: [{ answer }] }],
    });

    expect(result.error).toBeUndefined();
    expect(result.value.questions[0].fields[0].answer).toEqual(answer);
  });

  test("rejects non-string members in array answers with a field-level Joi error", () => {
    const { error } = formRunnerPostRequestSchema.validate({
      questions: [{ fields: [{ answer: ["option one", false] }] }],
    });

    expect(error?.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: ["questions", 0, "fields", 0, "answer", 1],
          type: "string.base",
        }),
      ])
    );
  });
});
