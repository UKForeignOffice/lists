import { feedbackIngest } from "../controllers";
import * as feedbackModel from "server/models/feedback";

describe("Lists Controllers", () => {
  let req: any;
  let res: any;
  let next: any;
  let sampleFormRunnerWebhookPost: any;

  beforeEach(() => {
    req = {
      params: {
        reference: "123ABC",
      },
      query: {},
      body: {},
    };
    res = {
      render: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      redirect: jest.fn(),
      json: jest.fn(),
    };
    next = jest.fn();
    sampleFormRunnerWebhookPost = {
      "name": "Feedback Form",
      "questions": [
        {
          "question": "Were you able to find what you needed?",
          "fields": [
            {
              "key": "ableToFindWhatYouNeeded",
              "title": "Were you able to find what you needed?",
              "type": "text",
              "answer": false
            }
          ]
        },
        {
          "question": "Please tell us what info you were seeking",
          "fields": [
            {
              "key": "whatInfoYouWereSeeking",
              "title": "Please tell us what info you were seeking",
              "type": "text",
              "answer": "dsadsadsa"
            }
          ]
        },
        {
          "question": "How easy or difficult was it to find what you were looking for?",
          "fields": [
            {
              "key": "howEasyOrDifficultWasItToFindWhatYouWereLookingFor",
              "title": "How easy or difficult was it to find what you were looking for?",
              "type": "text",
              "answer": "Easy"
            }
          ]
        },
        {
          "question": "How easy or difficult was it to use this service?",
          "fields": [
            {
              "key": "howEasyOrDifficultWasItToUseThisService",
              "title": "How easy or difficult was it to use this service?",
              "type": "text",
              "answer": "Very easy"
            }
          ]
        },
        {
          "question": "How could we improve this service?",
          "fields": [
            {
              "key": "howCouldWeImproveThisService",
              "title": "How could we improve this service?",
              "type": "text",
              "answer": "dsadsadas"
            }
          ]
        },
        {
          "question": "How likely would you be to recommend this service to other people?",
          "fields": [
            {
              "key": "howLikelyWouldYouBeToRecommendThisServiceToOtherPeople",
              "title": "How likely would you be to recommend this service to other people?",
              "type": "text",
              "answer": "Extremely likely"
            }
          ]
        }
      ],
      "metadata": {
        "paymentSkipped": false
      }
    }
  });

  describe("feedbackIngest", () => {
    it("responds with error when feedback payload is incorrect", async () => {
      req.body = {};
      
      await feedbackIngest(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        "error": "\"questions\" is required",
      });
    });

    it("invokes createFeedback with correct parameters", async () => {
      const spyCreateFeedback = jest.spyOn(feedbackModel, "createFeedback").mockResolvedValue([] as any);
      req.body = sampleFormRunnerWebhookPost;

      await feedbackIngest(req, res, next);

      expect(res.json).toHaveBeenCalledWith({ success: true });
      expect(spyCreateFeedback).toHaveBeenCalledWith({
        type: "serviceFeedback",
        jsonData: {
          questionsAndAnswers: [
            {
              "question": "Were you able to find what you needed?",
              "answer": false
            },
            {
              "question": "Please tell us what info you were seeking",
              "answer": "dsadsadsa"
            },
            {
              "question": "How easy or difficult was it to find what you were looking for?",
              "answer": "Easy"
            },
            {
              "question": "How easy or difficult was it to use this service?",
              "answer": "Very easy"
            },
            {
              "question": "How could we improve this service?",
              "answer": "dsadsadas"
            },
            {
              "question": "How likely would you be to recommend this service to other people?",
              "answer": "Extremely likely"
            }
          ]
        }
      });
    });

    it("invokes next when createFeedback fails", async () => {
      const error = new Error("error");
      jest.spyOn(feedbackModel, "createFeedback").mockRejectedValue(error);
      req.body = sampleFormRunnerWebhookPost;

      await feedbackIngest(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
