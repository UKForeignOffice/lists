import type * as PrismaClient from "@prisma/client";
import type { ListJsonData, Country } from "dashboard/models/types";
// ListItem

export type ListItem = PrismaClient.ListItem;

export interface List extends PrismaClient.List {
  id: number;
  reference: string;
  createdAt: Date;
  updatedAt: Date;
  type: string;
  countryId: number;
  jsonData: ListJsonData;
  country?: Partial<Country>;
  isAnnualReview: boolean;
  nextAnnualReviewStartDate: Date;
  lastAnnualReviewStartDate: Date | null;
}
