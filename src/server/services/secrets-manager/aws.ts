import { SecretsManagerClient, CreateSecretCommand, GetSecretValueCommand, PutSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import { AWS_REGION } from "server/config";
import { differenceInDays } from "date-fns";
import { logger } from "./../logger";
import { generateRandomSecret } from "./helpers";

let secretsManager: SecretsManagerClient;

function getAWSSecretsManager(): SecretsManagerClient {
  secretsManager ??= new SecretsManagerClient({
    region: AWS_REGION,
  });

  return secretsManager;
}

export async function createSecret(secretName: string): Promise<boolean> {
  const secretsManager = getAWSSecretsManager();

  const params = {
    Name: secretName,
    SecretString: generateRandomSecret(),
  };

  try {
    await secretsManager.send(new CreateSecretCommand(params));
    return true;
  } catch (error) {
    logger.error(`createSecret Error: ${error.message}`);
    return false;
  }
}

export async function rotateSecret(secretName: string): Promise<boolean> {
  try {
    const secretsManager = getAWSSecretsManager();
    const { CreatedDate, ARN } = await secretsManager.send(new GetSecretValueCommand({ SecretId: secretName }));

    if (CreatedDate === undefined || ARN === undefined) {
      throw new Error(`Could not getSecret values for secret ${secretName}`);
    }

    const secretAgeInDays = differenceInDays(new Date(), CreatedDate);
    logger.info(secretAgeInDays);

    if (secretAgeInDays < 30) {
      return false;
    }

    const params = {
      SecretId: ARN,
      SecretString: generateRandomSecret(),
    };

    await secretsManager.send(new PutSecretValueCommand(params));
    logger.info(`Rotate secret ${secretName} successfully`);
    return true;
  } catch (error) {
    logger.error(`rotateSecret: Failed to rotate secret ${secretName}. Error: ${error.message}`);
    return false;
  }
}

export async function getSecretValue(secretName: string): Promise<string> {
  const secretsManager = getAWSSecretsManager();
  const params = { SecretId: secretName };

  try {
    const { SecretString } = await secretsManager.send(new GetSecretValueCommand(params));
    return `${SecretString}`;
  } catch (error) {
    if (error.name === "ResourceNotFoundException") {
      await createSecret(secretName);
      return await getSecretValue(secretName);
    } else {
      logger.error(`getSecretValue Error: ${error.message}`);
      throw error;
    }
  }
}
