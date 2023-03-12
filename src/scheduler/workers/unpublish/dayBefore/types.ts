export interface Meta {
  /**
   * annual review reference for list (`List.jsonData.currentAnnualReview.reference`)
   */
  reference: string;
  daysUntilUnpublish: number;
  parsedUnpublishDate: string;
  countryName: string;
}
