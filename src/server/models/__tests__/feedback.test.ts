import { prisma } from "../db/__mocks__/prisma-client";
import { createFeedback, findFeedbackByType } from "../feedback";

jest.mock("../db/prisma-client");

describe("Feedback Model:", () => {
  let questionsAndAnswers: any;
  let sampleFeedback: any;

  beforeEach(() => {
    questionsAndAnswers = [
      {
        question: "Were you able to find what you needed?",
        answer: false,
      },
      {
        question: "Please tell us what info you were seeking",
        answer: "dsadsadsa",
      },
      {
        question:
          "How easy or difficult was it to find what you were looking for?",
        answer: "Easy",
      },
      {
        question: "How easy or difficult was it to use this service?",
        answer: "Very easy",
      },
      {
        question: "How could we improve this service?",
        answer: "dsadsadas",
      },
      {
        question:
          "How likely would you be to recommend this service to other people?",
        answer: "Extremely likely",
      },
    ];

    sampleFeedback = {
      id: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      type: "feedback",
      questionsAndAnswers,
    };
  });

  describe("createFeedback", () => {
    it("throws when trying to create feedback without type", async () => {
      await expect(
        createFeedback({
          // @ts-expect-error-next-line
          type: undefined,
          jsonData: { questionsAndAnswers },
        })
      ).rejects.toThrow("Feedback type is required");
    });

    it("should create a feedback object", async () => {
      prisma.feedback.create.mockResolvedValueOnce(sampleFeedback);

      const feedback = await createFeedback({
        type: "feedback",
        jsonData: { questionsAndAnswers },
      });

      expect(feedback).toEqual(sampleFeedback);
      expect(prisma.feedback.create).toHaveBeenCalledWith({
        data: {
          type: "feedback",
          jsonData: { questionsAndAnswers },
        },
      });
    });

    it("throws when when feedback.create fails", async () => {
      const error = new Error("error");
      prisma.feedback.create.mockRejectedValueOnce(error);

      await expect(
        createFeedback({
          type: "feedback",
          jsonData: { questionsAndAnswers },
        })
      ).rejects.toThrow(error);
    });
  });

  describe("findFeedbackByType", () => {
    it("throws if without type", async () => {
      await expect(
        // @ts-expect-error-next-line
        findFeedbackByType()
      ).rejects.toThrow("Feedback type is required");
    });

    it("invokes findMany with correct parameters", async () => {
      prisma.feedback.findMany.mockResolvedValueOnce([sampleFeedback]);

      const results = await findFeedbackByType("feedback");

      expect(results).toEqual([sampleFeedback]);
      expect(prisma.feedback.findMany).toHaveBeenCalledWith({
        where: { type: "feedback" },
        orderBy: {
          id: "desc",
        },
      });
    });

    it("throws when when feedback.findMany fails", async () => {
      const error = new Error("error");
      prisma.feedback.findMany.mockRejectedValueOnce(error);

      await expect(findFeedbackByType("feedback")).rejects.toThrow(error);
    });
  });
});
