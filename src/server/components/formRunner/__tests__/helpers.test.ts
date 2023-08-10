import { getNewSessionWebhookData } from "../helpers";
import { LawyerListItemGetObject, BaseListItemGetObject } from "../../../../server/models/types";
import { ServiceType } from "../../../../shared/types";
import { generateFormRunnerWebhookData } from "../../../../server/components/formRunner/lawyers";
import { Status } from "@prisma/client";
import * as FormRunner from "./../types";
import { LawyerJsonData } from "../../../models/listItem/providers/deserialisers/types";

jest.mock("supertest", () =>
  jest.fn().mockReturnValue({
    get: jest.fn().mockResolvedValue({ status: 200 }),
  })
);

describe("Form Runner Service:", () => {
  describe("generateFormRunnerWebhookObject", () => {
    const listJson: LawyerJsonData = {
      "address.firstLine": "1 Plaza De Centro",
      addressCountry: "Italy",
      city: "Milan",
      type: ServiceType.lawyers,
      size: "Medium (16-350 legal professionals)",
      country: "Italy",
      proBono: false,
      regions: "Milan, Rome, Florence, Genoa, Verona, Livorno",
      legalAid: true,
      metadata: {
        emailVerified: true,
      },
      areasOfLaw: [
        "Bankruptcy",
        "Corporate",
        "Criminal",
        "Employment",
        "Family",
        "Health",
        "Immigration",
        "Intellectual property",
        "International",
        "Maritime",
        "Personal injury",
        "Real estate",
      ],
      regulators: "Ordine Avvocati di Milano",
      contactName: "Cristiano Cominotto",
      declaration: ["confirm"],
      phoneNumber: "+393355928732",
      emailAddress: "ignoremyemail@noemail-ignoreme.uk",
      publishEmail: "Yes",
      speakEnglish: true,
      websiteAddress: "https://www.alassistenzalegale.it/?lang=en",
      organisationName: "AL Assistenza Legale",
      representedBritishNationals: true,
      postCode: "999999",
    };

    const getObject: BaseListItemGetObject = {
      address: {
        city: "Milan",
        country: { id: 1, name: "Italy" },
        firstLine: "1 Plaza De Centro",
        postCode: "999999",
      },
      id: 1,
      reference: "test",
      createdAt: new Date("19-Feb-2022 12:00:00"),
      updatedAt: new Date("19-Feb-2022 12:00:00"),
      type: "lawyers",
      jsonData: listJson,
      addressId: 1,
      isApproved: true,
      isPublished: false,
      isBlocked: false,
      listId: 1,
      status: Status.NEW,
      isAnnualReview: false,
    };

    const expectedListOutput: Array<Partial<FormRunner.Question>> = [
      {
        fields: [
          {
            answer: true,
            key: "speakEnglish",
          },
        ],
        question: "Can you provide legal services and support to customers in English?",
      },
      {
        fields: [
          {
            answer: "Cristiano Cominotto",
            key: "contactName",
          },
        ],
        question: "Your full name",
      },
      {
        fields: [
          {
            answer: "AL Assistenza Legale",
            key: "organisationName",
          },
          {
            answer: "1 Plaza De Centro",
            key: "address.firstLine",
          },
          {
            answer: undefined,
            key: "address.secondLine",
          },
          {
            answer: "Milan",
            key: "city",
          },
          {
            answer: "999999",
            key: "postCode",
          },
          {
            answer: "Italy",
            key: "addressCountry",
          },
        ],
        question: "Company name and address",
      },
      {
        fields: [
          {
            answer: "https://www.alassistenzalegale.it/?lang=en",
            key: "websiteAddress",
          },
        ],
        question: "Full website address (Optional)",
      },
      {
        fields: [
          {
            answer: "ignoremyemail@noemail-ignoreme.uk",
            key: "emailAddress",
          },
          {
            answer: "Yes",
            key: "publishEmail",
          },
        ],
        question: "Email address",
      },
      {
        fields: [
          {
            answer: [
              "Bankruptcy",
              "Corporate",
              "Criminal",
              "Employment",
              "Family",
              "Health",
              "Immigration",
              "Intellectual property",
              "International",
              "Maritime",
              "Personal injury",
              "Real estate",
            ],
            key: "areasOfLaw",
          },
        ],
        question: "In what areas of law are you qualified to practise? ",
      },
      {
        fields: [
          {
            answer: true,
            key: "legalAid",
          },
        ],
        question: "Can you provide legal aid to British nationals?",
      },
      {
        fields: [
          {
            answer: false,
            key: "proBono",
          },
        ],
        question: "Can you offer pro bono service to British nationals?",
      },
      {
        fields: [
          {
            answer: true,
            key: "representedBritishNationals",
          },
        ],
        question: "Have you represented British nationals before?",
      },
      {
        fields: [
          {
            answer: "+393355928732",
            key: "phoneNumber",
          },
          {
            key: "contactPhoneNumber",
            answer: undefined,
          },
        ],
        question: "Phone number",
      },
      {
        fields: [
          {
            answer: "Ordine Avvocati di Milano",
            key: "regulators",
          },
        ],
        question: "Which legal regulator or local bar associations are you registered with?",
      },
      {
        fields: [
          {
            answer: ["confirm"],
            key: "declaration",
          },
        ],
        question: "Declaration",
      },
      {
        fields: [
          {
            answer: "Italy",
            key: "country",
          },
        ],
        question: "Which list of lawyers do you want to be added to?",
      },
      {
        fields: [
          {
            answer: "Milan, Rome, Florence, Genoa, Verona, Livorno",
            key: "regions",
          },
        ],
        question: "Which regions do you serve?",
      },
      {
        fields: [
          {
            answer: "Medium (16-350 legal professionals)",
            key: "size",
          },
        ],
        question: "What size is your company or firm?",
      },
      {
        fields: [
          {
            answer: undefined,
            key: "publicEmailAddress",
          },
        ],
        question: "Email address for GOV.UK",
      },
    ];

    const options = {
      message: "Change the text",
      callbackUrl: "https://test-domain/ingest/lawyers/111",
      redirectPath: "/summary",
    };
    const expectedNewSessionWebhookData = {
      options,
      name: "Changes required",
      questions: expectedListOutput,
    };

    test("generated form runner webhook data is correct", async () => {
      const result = await generateFormRunnerWebhookData(getObject as LawyerListItemGetObject);

      expect(result).toMatchObject(expectedListOutput);
    });
    test("generated object is correct", async () => {
      const result = await generateFormRunnerWebhookData(getObject as LawyerListItemGetObject);
      const newSessionWebhookData = getNewSessionWebhookData({
        listType: "lawyers",
        listItemId: 111,
        questions: result,
        message: "Change the text",
        isAnnualReview: false,
        listItemRef: "112",
      });

      expect(newSessionWebhookData.questions).toMatchObject(expectedNewSessionWebhookData.questions);
    });
  });
});
