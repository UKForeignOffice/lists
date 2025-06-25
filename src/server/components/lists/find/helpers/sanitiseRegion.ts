/**
 * Sanitises a region string by removing characters that could be used in XSS attacks.
 * This includes: < > " ' / \ ; ( ) { } and backticks.
 * Also trims leading/trailing whitespace.
 *
 * @param region - The user-inputted region string
 * @returns A safe, sanitised version of the region
 */
export function sanitiseRegion(region: string): string {
  return region
    .replace(/[<>"'/\\;(){}[\]`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
