import crypto from "crypto";

export function generateRandomSecret(): string {
  return crypto.randomBytes(128).toString("hex");
}
