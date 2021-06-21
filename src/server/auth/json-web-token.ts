import jwt, { SignOptions } from "jsonwebtoken";
import { random, noop } from "lodash";
import { logger } from "server/services/logger";
import { getSecretValue, rotateSecret } from "server/services/secrets-manager";
import { User } from "server/models/types";
import { JWT_ALGORITHM, JWT_EXPIRE_TIME, authRoutes } from "./constants";

const ONE_MINUTE = 60000;
const SECRET_NAME = "JWT_SECRET";
const JWT_OPTIONS: SignOptions = {
  algorithm: JWT_ALGORITHM,
  expiresIn: JWT_EXPIRE_TIME,
};

let JWT_SECRET: string;

export async function getJwtSecret(): Promise<string> {
  if (JWT_SECRET === undefined) {
    JWT_SECRET = await getSecretValue(SECRET_NAME);

    setTimeout(() => {
      rotateSecret(SECRET_NAME).catch(noop);
    }, random(200) * ONE_MINUTE);
  }

  return JWT_SECRET;
}

export async function createAuthenticationJWT(
  user: Pick<User, "email">
): Promise<string | boolean> {
  try {
    const secret = await getJwtSecret();
    return jwt.sign({ user }, secret, JWT_OPTIONS);
  } catch (error) {
    logger.error(`createLoginJWT Error: ${error.message}`);
    return false;
  }
}

export async function createAuthenticationPath(
  user: Pick<User, "email">
): Promise<string | boolean> {
  try {
    const token = await createAuthenticationJWT(user);
    return `${authRoutes.login}?token=${token}`;
  } catch (error) {
    logger.error(`createLoginJWT Error: ${error.message}`);
    return false;
  }
}
