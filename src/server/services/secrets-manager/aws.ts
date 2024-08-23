import { SecretsManagerClient, GetSecretValueCommand} from "@aws-sdk/client-secrets-manager";
import { AWS_REGION } from "server/config";
import { logger } from "./../logger";

let secretsManagerClient: SecretsManagerClient;

export function getAWSSecretsManagerClient(): SecretsManagerClient {
  secretsManagerClient ??= new SecretsManagerClient({
    apiVersion: "2017-10-17",
    region: AWS_REGION,
  });

  return secretsManagerClient;
}

export async function getSecretValue(secretName: string): Promise<string> {
  const client = getAWSSecretsManagerClient();
  const params = { SecretId: secretName };

  try {
    const secret = await client.send(new GetSecretValueCommand(params));
    return `${secret.SecretString}`;
  } catch (error) {
    logger.error(`getSecretValue Error: ${error.message}`);
    throw error;
  }
}
