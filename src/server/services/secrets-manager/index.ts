import { isLocalHost, isDev } from "server/config";
import * as local from "./local";
import * as aws from "./aws";

const shouldUseLocalSecretsManager =
  isLocalHost || isDev || process.env.SECRETS_MANAGER === "local";

interface SecretsManager {
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

const { getSecretValue } = getSecretsManager();

export { getSecretValue };
