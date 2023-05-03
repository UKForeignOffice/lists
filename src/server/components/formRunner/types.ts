import { ServiceType } from "server/models/types";

export interface Component {
  name: string;
  title: string;
  options: Record<string, unknown>;
  type: string;
  content: string;
  schema: Record<string, unknown>;
}

export interface Field {
  key: string;
  answer: any;
  title?: string;
  index?: number;
}

export interface Question {
  category?: string;
  question: string;
  fields: Field[];
}

export interface NewSessionData {
  questions: Array<Partial<Question>> | undefined;
  options: {
    message: string;
    callbackUrl: string;
    redirectPath: string;
  };
  metadata: Record<string, any>;
  name: string;
}

export interface WebhookData {
  questions: Question[];

  /**
   * FormRunner JSON should include in the metadata { type: ServiceType }
   * for easy identification of webhook type at ingest point. Other properties may be used for similar reasons (hence additionalProps)
   */
  metadata: {
    type: ServiceType;
    isAnnualReview?: boolean;
    [additionalProps: string]: any;
  };
}

export interface Page {
  title: string;
  path: string;
  controller: string;
  components?: Component[];
  section?: string; // the section ID
  next?: Array<{ path: string; condition?: string }>;
}
