import { isLocalHost, isTest } from "server/config";

const shouldUseLocalSecretsManager = isLocalHost || isTest;

interface SecretsManager {
  createSecret: (secretName: string) => Promise<boolean>;
  rotateSecret: (secretName: string) => Promise<boolean>;
  getSecretValue: (secretName: string) => Promise<string>;
}

/**
 * Depending on the runtime environment, load the LocalSecretsManager or (AWS) SecretsManager.
 */
async function getSecretsManager(): Promise<SecretsManager> {
  return await (shouldUseLocalSecretsManager
    ? import("./local")
    : import("./aws"));
}
const { createSecret, rotateSecret, getSecretValue } =
  await getSecretsManager();

export { createSecret, rotateSecret, getSecretValue };
