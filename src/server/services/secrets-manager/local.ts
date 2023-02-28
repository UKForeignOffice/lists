import { SecretsManager } from "aws-sdk";
import { differenceInDays } from "date-fns";
import { logger } from "./../logger";
import { GetSecretValueResponse } from "aws-sdk/clients/secretsmanager";
import { generateRandomSecret } from "./helpers";

let secretsManager: LocalSecretsManager;

class LocalSecretsManager {
  secrets: Record<string, GetSecretValueResponse>= {};
  constructor(options?: SecretsManager.Types.ClientConfiguration) {
    logger.info("Using LocalSecretsManager");
  }

  async createSecret(
    params: SecretsManager.Types.CreateSecretRequest
  ): Promise<boolean> {
    const { Name, SecretString } = params;
    this.secrets[Name] = {
      SecretString,
      CreatedDate: new Date(),
      ARN: "some-ARN",
    };

    return true;
  }

  async putSecretValue({
    SecretId,
    SecretString,
  }: {
    SecretId: string;
    SecretString: string;
  }): Promise<any> {
    this.secrets[SecretId] = { SecretString };
  }

  async getSecretValue(
    params: SecretsManager.Types.GetSecretValueRequest
  ): Promise<SecretsManager.Types.GetSecretValueResponse> {
    const { SecretId } = params;
    const secret = this.secrets[SecretId];
    if (secret != null) {
      return secret;
    } else {
      throw Error(`Couldn't getSecretValue with name ${SecretId}`);
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
    logger.error(`SecretsManager createSecret Error: ${error.message}`);
    return false;
  }
}

export async function rotateSecret(secretName: string): Promise<boolean> {
  try {
    const secretsManager = getLocalSecretsManager();
    const { CreatedDate, ARN } = await secretsManager.getSecretValue({
      SecretId: secretName,
    });

    if (CreatedDate === undefined || ARN === undefined) {
      throw new Error(`Could not getSecret values for secret ${secretName}`);
    }

    const secretAgeInDays = differenceInDays(new Date(), CreatedDate);

    if (secretAgeInDays < 30) {
      return false;
    }

    const params = {
      SecretId: ARN,
      SecretString: generateRandomSecret(),
    };

    await secretsManager.putSecretValue(params);
    logger.info(`Rotate secret ${secretName} successfully`);
    return true;
  } catch (error) {
    logger.error(
      `Failed to rotate secret ${secretName}. Error: ${error.message}`
    );
    return false;
  }
}

export async function getSecretValue(secretName: string): Promise<string> {
  const secretsManager = getLocalSecretsManager();
  const params = { SecretId: secretName };

  try {
    const secret = await secretsManager.getSecretValue(params);
    return `${secret.SecretString}`;
  } catch (error) {
    await createSecret(secretName);
    return await getSecretValue(secretName);
  }
}
