import { isLocalHost, isTest } from "server/config";
import * as local from "./local";
import * as aws from "./aws";

const shouldUseLocalSecretsManager = isLocalHost || isTest || process.env.SECRETS_MANAGER === "local";

interface SecretsManager {
  createSecret: (secretName: string) => Promise<boolean>;
  rotateSecret: (secretName: string) => Promise<boolean>;
  getSecretValue: (secretName: string) => Promise<string>;
}

/**
 * Depending on the NODE_ENV or SECRETS_MANAGER,
 * load the LocalSecretsManager or (AWS) SecretsManager.
 */
function getSecretsManager(): SecretsManager {
  if (shouldUseLocalSecretsManager) {
    return local;
  }

  return aws;
}

const { createSecret, rotateSecret, getSecretValue } = getSecretsManager();

export { createSecret, rotateSecret, getSecretValue };
