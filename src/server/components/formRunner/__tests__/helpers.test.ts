import supertest from "supertest";
import * as child_process from "child_process";
import {
  startFormRunner,
  isFormRunnerReady,
  parseFormRunnerWebhookObject,
} from "../helpers";

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
        "PRIVACY_POLICY_URL='' npm run form-runner:start",
        { shell: true }
      );
    });
  });

  describe("parseFormRunnerWebhookObject", () => {
    test("parsed object is correct", () => {
      const webHookData: any = {
        metadata: {},
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
                key: "firstName",
                title: "First name",
                type: "text",
                answer: "Rene",
              },
              { key: "middleName", title: "Middle name", type: "text" },
              {
                key: "surname",
                title: "Surname",
                type: "text",
                answer: "Descartes",
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
                key: "addressLine1",
                title: "Address line 1",
                type: "text",
                answer: "Cogito, Ergo Sum Street",
              },
              { key: "addressLine2", title: "Address line 2", type: "text" },
              {
                key: "city",
                title: "Town or city",
                type: "text",
                answer: "Touraine",
              },
              {
                key: "postcode",
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

      const result = parseFormRunnerWebhookObject(webHookData);

      expect(result).toMatchObject({
        speakEnglish: true,
        isQualified: true,
        memberOfRegulatoryAuthority: true,
        regulatoryAuthority: "Some Authority",
        firstName: "Rene",
        middleName: undefined,
        surname: "Descartes",
        organisationName: "{{organisationName}}",
        websiteAddress: "www.covidtest1.com",
        emailAddress: "email@domain.com",
        phoneNumber: "777766665555",
        addressLine1: "Cogito, Ergo Sum Street",
        addressLine2: undefined,
        city: "Touraine",
        postcode: "123456",
        country: "France",
        testTypes: "Polymerase chain reaction (PCR)",
        turnaroundTimes: "24 hours",
        providesCertificateTranslation: true,
        bookingOptions: "Online, Phone, In Person",
        declarationConfirm: "confirm",
      });
    });
  });
});
