import { SecretsManagerClient, CreateSecretCommand, GetSecretValueCommand, PutSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import { AWS_REGION } from "server/config";
import { differenceInDays } from "date-fns";
import { logger } from "./../logger";
import { generateRandomSecret } from "./helpers";

let secretsManagerClient: SecretsManagerClient;

export function getAWSSecretsManagerClient(): SecretsManagerClient {
  secretsManagerClient ??= new SecretsManagerClient({
    apiVersion: "2017-10-17",
    region: AWS_REGION,
  });

  return secretsManagerClient;
}

export async function createSecret(secretName: string): Promise<boolean> {
  const client = getAWSSecretsManagerClient();

  const params = {
    Name: secretName,
    SecretString: generateRandomSecret(),
  };

  try {
    await client.send(new CreateSecretCommand(params));
    return true;
  } catch (error) {
    logger.error(`createSecret Error: ${error.message}`);
    return false;
  }
}

export async function rotateSecret(secretName: string): Promise<boolean> {
  try {
    const client = getAWSSecretsManagerClient();
    const { CreatedDate, ARN } = await client.send(new GetSecretValueCommand({ SecretId: secretName }));

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

    await client.send(new PutSecretValueCommand(params));
    logger.info(`Rotate secret ${secretName} successfully`);
    return true;
  } catch (error) {
    logger.error(`rotateSecret: Failed to rotate secret ${secretName}. Error: ${error.message}`);
    return false;
  }
}

export async function getSecretValue(secretName: string): Promise<string> {
  const client = getAWSSecretsManagerClient();
  const params = { SecretId: secretName };

  try {
    const secret = await client.send(new GetSecretValueCommand(params));
    return `${secret.SecretString}`;
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
