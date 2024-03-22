import { differenceInDays } from "date-fns";
import { logger } from "../logger";
import { generateRandomSecret } from "./helpers";

interface SecretValue {
  SecretString?: string;
  CreatedDate?: Date;
  ARN?: string;
}

interface CreateSecretRequest {
  Name: string;
  SecretString: string;
}

interface GetSecretValueRequest {
  SecretId: string;
}

interface PutSecretValueRequest {
  SecretId: string;
  SecretString: string;
}

let secretsManager: LocalSecretsManager;

class LocalSecretsManager {
  private secrets: Record<string, SecretValue> = {};

  constructor() {
    logger.info("Using LocalSecretsManager");
  }

  async createSecret(params: CreateSecretRequest): Promise<boolean> {
    const { Name, SecretString } = params;
    this.secrets[Name] = {
      SecretString,
      CreatedDate: new Date(),
      ARN: "some-ARN",
    };
    return true;
  }

  async putSecretValue(params: PutSecretValueRequest): Promise<void> {
    const { SecretId, SecretString } = params;
    if (this.secrets[SecretId]) {
      this.secrets[SecretId].SecretString = SecretString;
    }
  }

  async getSecretValue(params: GetSecretValueRequest): Promise<SecretValue> {
    const { SecretId } = params;
    const secret = this.secrets[SecretId];
    if (secret) {
      return secret;
    } else {
      throw new Error(`Couldn't getSecretValue with name ${SecretId}`);
    }
  }
}

export function getLocalSecretsManager(): LocalSecretsManager {
  secretsManager ??= new LocalSecretsManager();
  return secretsManager;
}

export async function createSecret(secretName: string): Promise<boolean> {
  const secretsManager = getLocalSecretsManager();

  const params = {
    Name: secretName,
    SecretString: generateRandomSecret(),
  };

  try {
    await secretsManager.createSecret(params);
    return true;
  } catch (error) {
    logger.error(`createSecret: SecretsManager createSecret Error: ${error.message}`);
    return false;
  }
}

export async function rotateSecret(secretName: string): Promise<boolean> {
  try {
    const secretsManager = getLocalSecretsManager();
    const secret = await secretsManager.getSecretValue({
      SecretId: secretName,
    });

    if (!secret.CreatedDate || !secret.ARN) {
      throw new Error(`Could not getSecret values for secret ${secretName}`);
    }

    const secretAgeInDays = differenceInDays(new Date(), secret.CreatedDate);

    if (secretAgeInDays < 30) {
      return false;
    }

    await secretsManager.putSecretValue({
      SecretId: secret.ARN,
      SecretString: generateRandomSecret(),
    });
    logger.info(`Rotate secret ${secretName} successfully`);
    return true;
  } catch (error) {
    logger.error(`rotateSecret: Failed to rotate secret ${secretName}. Error: ${error.message}`);
    return false;
  }
}

export async function getSecretValue(secretName: string): Promise<string> {
  const secretsManager = getLocalSecretsManager();
  const params = { SecretId: secretName };

  try {
    const secret = await secretsManager.getSecretValue(params);
    if (secret?.SecretString) {
      return secret.SecretString;
    } else {
      throw new Error(`Secret ${secretName} has no value.`);
    }
  } catch (error) {
    await createSecret(secretName);
    return await getSecretValue(secretName);
  }
}
