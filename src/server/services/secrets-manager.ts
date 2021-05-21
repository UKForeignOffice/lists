import crypto from "crypto";
import { SecretsManager } from "aws-sdk";
import {
  AWS_REGION,
  LOCATION_SERVICE_ACCESS_KEY,
  LOCATION_SERVICE_SECRET_KEY,
} from "server/config";
import { logger } from "./logger";

// TODO
// if (GOVUK_NOTIFY_API_KEY === undefined) {
//   throw new Error("Environment variable GOVUK_NOTIFY_API_KEY is missing");
// }
let secretsManager: SecretsManager;

export function getAWSSecretsManager(): SecretsManager {
  if (secretsManager === undefined) {
    secretsManager = new SecretsManager({
      apiVersion: "2017-10-17",
      region: AWS_REGION,
    });

    secretsManager.config.credentials = {
      accessKeyId: LOCATION_SERVICE_ACCESS_KEY ?? "",
      secretAccessKey: LOCATION_SERVICE_SECRET_KEY ?? "",
    };
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
