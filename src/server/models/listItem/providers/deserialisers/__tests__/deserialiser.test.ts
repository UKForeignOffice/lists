import { baseDeserialiser } from "../index";

const webhookData = {
  metadata: {
    type: "covidTestProviders",
  },
  name: "Find a Professional Service Abroad covid-test-provider",
  questions: [
    {
      question: "Do you speak fluent English?",
      fields: [
        {
          key: "speakEnglish",
          title: "Do you speak English?",
          type: "text",
          answer: true,
        },
      ],
    },
    {
      question: "How do you like your eggs?",
      fields: [
        {
          key: "eggs",
          title: "How do you like your eggs?",
          type: "text",
          answer: "poached",
        },
      ],
    },
  ],
};

test("baseDeserialiser does not remove unknown key/values", () => {
  expect(baseDeserialiser(webhookData)).toEqual({
    eggs: "poached",
    speakEnglish: true,
    type: "covidTestProviders",
  });
});

test("baseDeserialiser input with missing questions does not cause an unexpected crash", () => {
  expect(baseDeserialiser({ metadata: { type: "lawyers" } })).toEqual({
    type: "lawyers",
  });
});

test("baseDeserialiser input with empty questions (i.e. no fields) does not cause an unexpected crash", () => {
  expect(baseDeserialiser({ metadata: { type: "lawyers" }, questions: [] })).toEqual({
    type: "lawyers",
  });
});

test("baseDeserialiser extracts service type from metadata", () => {
  expect(baseDeserialiser({ metadata: { type: "lawyers" }, questions: [] })).toEqual({ type: "lawyers" });
});
