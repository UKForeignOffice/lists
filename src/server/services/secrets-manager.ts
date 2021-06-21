import crypto from "crypto";
import { SecretsManager } from "aws-sdk";
import { AWS_REGION } from "server/config";
import { differenceInDays } from "date-fns";
import { logger } from "./logger";

let secretsManager: SecretsManager;

function generateRandomSecret(): string {
  return crypto.randomBytes(128).toString("hex");
}

export function getAWSSecretsManager(): SecretsManager {
  if (secretsManager === undefined) {
    secretsManager = new SecretsManager({
      apiVersion: "2017-10-17",
      region: AWS_REGION,
    });
  }

  return secretsManager;
}

export async function createSecret(secretName: string): Promise<boolean> {
  const secretsManager = getAWSSecretsManager();

  const params = {
    Name: secretName,
    SecretString: generateRandomSecret(),
  };

  try {
    await secretsManager.createSecret(params).promise();
    return true;
  } catch (error) {
    logger.error(`SecretsManager createSecret Error: ${error.message}`);
    return false;
  }
}

export async function rotateSecret(secretName: string): Promise<boolean> {
  try {
    const secretsManager = getAWSSecretsManager();
    const { CreatedDate, ARN } = await secretsManager
      .getSecretValue({ SecretId: secretName })
      .promise();

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

    await secretsManager.putSecretValue(params).promise();
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
  const secretsManager = getAWSSecretsManager();
  const params = { SecretId: secretName };

  try {
    const secret = await secretsManager.getSecretValue(params).promise();
    return `${secret.SecretString}`;
  } catch (error) {
    if (error.code === "ResourceNotFoundException") {
      await createSecret(secretName);
      return await getSecretValue(secretName);
    } else {
      logger.error(`SecretsManager getSecretValue Error: ${error.message}`);
      throw error;
    }
  }
}
