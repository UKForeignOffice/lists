import crypto from "crypto";
import { SecretsManager } from "aws-sdk";
import { AWS_REGION } from "server/config";
import { logger } from "./logger";
let secretsManager: SecretsManager;

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
    SecretString: crypto.randomBytes(128).toString("hex"),
  };

  try {
    await secretsManager.createSecret(params).promise();
    logger.info(`SecretsManager created secret for ${secretName}`);
    return true;
  } catch (error) {
    logger.error(`SecretsManager createSecret Error: ${error.message}`);
    return false;
  }
}

export async function getSecretValue(secretName: string): Promise<string> {
  const secretsManager = getAWSSecretsManager();
  const params = { SecretId: secretName };

  try {
    const result = await secretsManager.getSecretValue(params).promise();
    logger.info(`SecretsManager got secret for ${secretName}`);
    return `${result.SecretString}`;
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
