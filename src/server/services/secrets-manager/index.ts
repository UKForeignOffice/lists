import { isLocalHost, isTest } from "server/config";

const shouldUseLocalSecretsManager = isLocalHost || isTest;

interface SecretsManager {
  createSecret: (secretName: string) => Promise<boolean>;
  rotateSecret: (secretName: string) => Promise<boolean>;
  getSecretValue: (secretName: string) => Promise<string>;
}
async function getSecretsService(): Promise<SecretsManager> {
  return await (shouldUseLocalSecretsManager
    ? import("./local")
    : import("./aws"));
}
const { createSecret, rotateSecret, getSecretValue } =
  await getSecretsService();

export { createSecret, rotateSecret, getSecretValue };
