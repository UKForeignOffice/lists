import { ingestPutController } from "../ingestPutController";
import { prisma } from "server/models/db/__mocks__/prisma-client";

import * as listItem from "server/models/listItem/listItem";
jest.mock("server/models/db/prisma-client");

const successJson = {
  questions: [
    {
      question: "Which list of lawyers do you want to be added to?",
      fields: [
        {
          key: "country",
          title: "Country list",
          type: "list",
          answer: "Switzerland",
        },
      ],
    },
    {
      question: "What size is your company or firm?",
      fields: [
        {
          key: "size",
          title: "Company size",
          type: "list",
          answer: "Independent lawyer / sole practitioner",
        },
      ],
    },
    {
      question: "Can you provide legal services and support to customers in English?",
      fields: [
        {
          key: "speakEnglish",
          title: "English language service",
          type: "list",
          answer: true,
        },
      ],
    },
    {
      question: "Which legal regulator or local bar associations are you registered with?",
      fields: [
        {
          key: "regulators",
          title: "Regulator(s)",
          type: "text",
          answer: "Zurich Law ",
        },
      ],
    },
    {
      question: "Your full name",
      fields: [
        {
          key: "contactName",
          title: "Your full name",
          type: "text",
          answer: "Jim Billbob",
        },
      ],
    },
    {
      question: "Company name and address",
      fields: [
        {
          key: "organisationName",
          title: "Company name",
          type: "text",
          answer: "Billbob Law",
        },
        {
          key: "address.firstLine",
          title: "Address line 1",
          type: "text",
          answer: "1 Straße Street",
        },
        {
          key: "address.secondLine",
          title: "Address line 2",
          type: "text",
          answer: null,
        },
        {
          key: "city",
          title: "Town or city ",
          type: "text",
          answer: "Zurich",
        },
        {
          key: "postCode",
          title: "Post code / area code",
          type: "text",
          answer: "99999",
        },
        {
          key: "addressCountry",
          title: "Country",
          type: "list",
          answer: "Switzerland",
        },
      ],
    },
    {
      question: "Email address",
      fields: [
        {
          key: "emailAddress",
          title: "Email address",
          type: "text",
          answer: "ali@cautionyourblast.com",
        },
        {
          key: "publishEmail",
          title: "Can we publish this email address on GOV.UK?",
          type: "list",
          answer: "Yes",
        },
      ],
    },
    {
      question: "Phone number",
      fields: [
        {
          key: "phoneNumber",
          title: "Phone number",
          type: "text",
          answer: "9999",
        },
        {
          key: "contactPhoneNumber",
          title: "Emergency / out of hours number",
          type: "text",
          answer: "99999",
        },
      ],
    },
    {
      question: "Full website address (Optional)",
      fields: [
        {
          key: "websiteAddress",
          title: "Website",
          type: "text",
          answer: null,
        },
      ],
    },
    {
      question: "Which regions do you serve?",
      fields: [
        {
          key: "regions",
          title: "Regions covered",
          type: "text",
          answer: "Zurich",
        },
      ],
    },
    {
      question: "In what areas of law are you qualified to practise? ",
      fields: [
        {
          key: "areasOfLaw",
          title: "Areas of law practised",
          type: "list",
          answer: [
            "Bankruptcy",
            "Corporate",
            "Criminal",
            "Employment",
            "Family",
            "Health",
            "Immigration",
            "Maritime",
            "Personal injury",
            "Real estate",
            "Tax",
          ],
        },
      ],
    },
    {
      question: "Can you provide legal aid to British nationals?",
      fields: [
        {
          key: "legalAid",
          title: "Can you provide legal aid to British nationals?",
          type: "list",
          answer: true,
        },
      ],
    },
    {
      question: "Can you offer pro bono service to British nationals?",
      fields: [
        {
          key: "proBono",
          title: "Can you offer pro bono service to British nationals?",
          type: "list",
          answer: true,
        },
      ],
    },
    {
      question: "Have you represented British nationals before?",
      fields: [
        {
          key: "representedBritishNationals",
          title: "Have you represented British nationals before?",
          type: "list",
          answer: true,
        },
      ],
    },
    {
      question: "Declaration",
      fields: [
        {
          key: "declaration",
          title: "Declaration",
          type: "list",
          answer: ["confirm"],
        },
      ],
    },
  ],
  metadata: {
    type: "lawyers",
    paymentSkipped: true,
  },
};
const sampleListItem = {
  id: "1",
  jsonData: { organisationName: "The Amazing Lawyers" },
  type: "lawyers",
  list: {
    id: 8,
  },
};

const response = {
  statusCode: 0,
  status(code: number) {
    this.statusCode = code;
    return this;
  },
  send(_error: any) {
    return this;
  },
  json(_error: any) {
    return this;
  },
  end() {},
};
test("responds with 422 for schema validation error", async () => {
  const spiedStatus = jest.spyOn(response, "status");
  const spiedSend = jest.spyOn(response, "json");
  jest.spyOn(listItem, "update").mockResolvedValue();

  const schemaErrorReq = {
    params: { id: 1, serviceType: "lawyers" },
    body: {},
  };
  // @ts-expect-error
  await ingestPutController(schemaErrorReq, response);
  const schemaError = spiedSend.mock.calls[0][0];
  expect(spiedStatus).toBeCalledWith(422);
  expect(schemaError.error).toBe("request could not be processed - post data could not be parsed");
});

test("responds with 422 for update error", async () => {
  const spiedStatus = jest.spyOn(response, "status");

  jest.spyOn(listItem, "update").mockRejectedValue("boo");

  const schemaErrorReq = {
    params: { id: 1, serviceType: "lawyers" },
    body: { questions: [] },
  };
  // @ts-expect-error
  await ingestPutController(schemaErrorReq, response);

  expect(spiedStatus).toBeCalledWith(422);
});

test("responds with 204 when update is successful", async () => {
  const req = {
    params: {
      id: 1,
      serviceType: "lawyers",
    },
    body: successJson,
  };
  // @ts-ignore
  prisma.listItem.findUnique.mockResolvedValue(sampleListItem);
  const spiedRes = jest.spyOn(response, "status");
  // @ts-expect-error
  await ingestPutController(req, response);
  expect(spiedRes).toBeCalledWith(204);
});

test.todo("failed update is inserted into queue");
