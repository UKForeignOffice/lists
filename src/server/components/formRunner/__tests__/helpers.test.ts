import supertest from "supertest";
import * as child_process from "child_process";
import {
  startFormRunner,
  isFormRunnerReady,
  getNewSessionWebhookData,
} from "../helpers";
import {
  LawyerListItemGetObject,
  LawyerListItemJsonData,
  BaseListItemGetObject,
} from "server/models/types";
import { generateFormRunnerWebhookData } from "server/components/formRunner/lawyers";
import { Status } from "@prisma/client";
import * as FormRunner from "./../types";
import { deserialise } from "../../../models/listItem/listItemCreateInputFromWebhook";

jest.mock("supertest", () =>
  jest.fn().mockReturnValue({
    get: jest.fn().mockResolvedValue({ status: 200 }),
  })
);

jest.mock("child_process");

describe("Form Runner Service:", () => {
  describe("isFormRunnerReady", () => {
    test("it returns true when form runner request is successful", async () => {
      const result = await isFormRunnerReady();

      expect(result).toBe(true);
      expect(supertest).toHaveBeenCalledWith("localhost:3001");
    });

    test("it returns false when form runner request fails", async () => {
      jest
        .spyOn(supertest(""), "get")
        .mockResolvedValue({ status: 400 } as any);
      const result = await isFormRunnerReady();

      expect(result).toBe(false);
    });

    test("it returns false when form runner request rejects", async () => {
      jest.spyOn(supertest(""), "get").mockRejectedValue("Error");
      const result = await isFormRunnerReady();

      expect(result).toBe(false);
    });
  });

  describe("startFormRunner", () => {
    test("spawn command is correct", async () => {
      let calls = 1;

      const mockGet: any = () => {
        if (calls === 1) {
          calls += 1;
          return { status: 500 };
        }

        return { status: 200 };
      };

      jest.spyOn(supertest(""), "get").mockImplementation(mockGet);

      const mockStderr = {
        on: jest.fn(),
      };

      const mockStdout = {
        on: jest.fn(),
      };

      jest.spyOn(child_process, "spawn").mockReturnValue({
        stderr: mockStderr,
        stdout: mockStdout,
        on: jest.fn(),
        once: jest.fn(),
      } as any);

      const result = await startFormRunner();

      expect(result).toBe(true);
      expect(child_process.spawn).toHaveBeenCalledWith(
        "NODE_CONFIG='{\"safelist\":[\"localhost\"]}' PRIVACY_POLICY_URL='' npm run form-runner:start",
        { shell: true }
      );
    });
  });

  describe("parseFormRunnerWebhookObject", () => {
    test("parsed object is correct", async () => {
      const webHookData: any = {
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
            index: 0,
          },
          {
            question:
              "Are you qualified to provide  Covid-19 tests in your country?",
            fields: [
              {
                key: "isQualified",
                title:
                  "Are you qualified to provide  Covid-19 tests in your country?",
                type: "text",
                answer: true,
              },
            ],
            index: 0,
          },
          {
            question:
              "Are you a member of a local regulatory authority or body?",
            fields: [
              {
                key: "memberOfRegulatoryAuthority",
                title:
                  "Are you a member of a local bar association or other regulatory authority/body?",
                type: "text",
                answer: true,
              },
            ],
            index: 0,
          },
          {
            question: "What is the name of the local regulatory authority?",
            fields: [
              {
                key: "regulatoryAuthority",
                title: "regulatoryAuthority",
                type: "text",
                answer: "Some Authority",
              },
            ],
            index: 0,
          },
          {
            question: "Full name",
            fields: [
              {
                key: "contactName",
                title: "contactName",
                type: "text",
                answer: "Winston Smith",
              },
            ],
            index: 0,
          },
          {
            question: "Company name",
            fields: [
              {
                key: "organisationName",
                title: "Organisation name",
                type: "text",
                answer: "{{organisationName}}",
              },
            ],
            index: 0,
          },
          {
            question: "Website address",
            fields: [
              {
                key: "websiteAddress",
                title: "Website address",
                type: "text",
                answer: "www.covidtest1.com",
              },
            ],
            index: 0,
          },
          {
            question: "Email address",
            fields: [
              {
                key: "emailAddress",
                title: "Email address",
                type: "text",
                answer: "email@domain.com",
              },
            ],
            index: 0,
          },
          {
            question: "Phone number",
            fields: [
              {
                key: "phoneNumber",
                title: "Phone number",
                type: "text",
                answer: "777766665555",
              },
            ],
            index: 0,
          },
          {
            question: "Company Address",
            fields: [
              {
                key: "address.firstLine",
                title: "Address line 1",
                type: "text",
                answer: "Cogito, Ergo Sum Street",
              },
              {
                key: "address.secondLine",
                title: "Address line 2",
                type: "text",
              },
              {
                key: "city",
                title: "Town or city",
                type: "text",
                answer: "Touraine",
              },
              {
                key: "postCode",
                title: "Postcode",
                type: "text",
                answer: "123456",
              },
              {
                key: "country",
                title: "Country",
                type: "text",
                answer: "France",
              },
            ],
            index: 0,
          },
          {
            question: "What types of Covid-19 tests do you offer?",
            fields: [
              {
                key: "testTypes",
                title: "What types of Covid-19 tests do you offer?",
                type: "text",
                answer: "Polymerase chain reaction (PCR)",
              },
            ],
            index: 0,
          },
          {
            question: "Turnaround time?",
            fields: [
              {
                key: "turnaroundTimes",
                title: "Turnaround times",
                type: "text",
                answer: "24 hours",
              },
            ],
            index: 0,
          },
          {
            question: "Do you provide english certificate translation?",
            fields: [
              {
                key: "providesCertificateTranslation",
                title: "Do you provide english certificate translation?",
                type: "text",
                answer: true,
              },
            ],
            index: 0,
          },
          {
            question: "What booking options do you offer?",
            fields: [
              {
                key: "bookingOptions",
                title: "Booking Options?",
                type: "text",
                answer: "Online, Phone, In Person",
              },
            ],
            index: 0,
          },
          {
            question: "Declaration",
            fields: [
              {
                key: "declarationConfirm",
                title: "Confirm",
                type: "text",
                answer: "confirm",
              },
            ],
            index: 0,
          },
        ],
      };

      const result = await deserialise(webHookData);

      expect(result).toMatchObject({
        type: "covidTestProviders",
        speakEnglish: true,
        isQualified: true,
        memberOfRegulatoryAuthority: true,
        regulatoryAuthority: "Some Authority",
        contactName: "Winston Smith",
        organisationName: "{{organisationName}}",
        websiteAddress: "www.covidtest1.com",
        emailAddress: "email@domain.com",
        phoneNumber: "777766665555",
        city: "Touraine",
        country: "France",
        testTypes: "Polymerase chain reaction (PCR)",
        turnaroundTimes: "24 hours",
        providesCertificateTranslation: true,
        bookingOptions: ["Online", "Phone", "In Person"],
        declarationConfirm: "confirm",
      });
    });
  });

  describe("generateFormRunnerWebhookObject", () => {
    const listJson: LawyerListItemJsonData = {
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
    };

    const expectedListOutput: Array<Partial<FormRunner.Question>> = [
      {
        fields: [
          {
            answer: true,
            key: "speakEnglish",
          },
        ],
        question:
          "Can you provide legal services and support to customers in English?",
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
        question:
          "Which legal regulator or local bar associations are you registered with?",
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
      const isUnderTest = true;
      const result = await generateFormRunnerWebhookData(
        getObject as LawyerListItemGetObject,
        isUnderTest
      );

      expect(result).toMatchObject(expectedListOutput);
    });
    test("generated object is correct", async () => {
      const isUnderTest = true;
      const result = await generateFormRunnerWebhookData(
        getObject as LawyerListItemGetObject,
        isUnderTest
      );
      const newSessionWebhookData = getNewSessionWebhookData(
        "lawyers",
        111,
        result,
        "Change the text"
      );

      expect(newSessionWebhookData.questions).toMatchObject(
        expectedNewSessionWebhookData.questions
      );
    });
  });
});
