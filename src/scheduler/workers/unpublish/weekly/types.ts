export interface Meta {
  /**
   * annual review reference for list (`List.jsonData.currentAnnualReview.reference`)
   */
  reference: string;
  weeksUntilUnpublish: number;
  weeksSinceStart: number;
  parsedUnpublishDate: string;
  countryName: string;
}
