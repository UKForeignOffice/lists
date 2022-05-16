import { NextFunction, Request, Response } from "express";
import { createFeedback } from "server/models/feedback";
import { FeedbackJsonData } from "server/models/types";
import {
  WebhookData,
  formRunnerPostRequestSchema,
} from "server/components/formRunner";

export async function feedbackIngest(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { value, error } = formRunnerPostRequestSchema.validate(req.body);

  if (error !== undefined) {
    res.status(400).json({ error: error.message });
    return;
  }

  const questionsAndAnswers: FeedbackJsonData["questionsAndAnswers"] =
    value.questions.reduce(
      (
        acc: FeedbackJsonData["questionsAndAnswers"],
        question: WebhookData["questions"][0]
      ) => {
        const { fields } = question;

        fields.forEach((field) => {
          const { title, answer } = field;
          acc.push({ question: title, answer });
        });

        return acc;
      },
      []
    );

  try {
    await createFeedback({
      type: "serviceFeedback",
      jsonData: {
        questionsAndAnswers,
      },
    });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}
