export function enforceHttps(string: string): string {
  return `https://${string.replace(/^https?:?\/?\/?/i, "")}`;
}
