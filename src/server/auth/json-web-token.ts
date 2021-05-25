import jwt, { SignOptions } from "jsonwebtoken";
import { logger } from "server/services/logger";
import { getSecretValue } from "server/services/secrets-manager";
import {
  JWT_ALGORITHM,
  JWT_EXPIRE_TIME,
  authRoutes,
} from "./constants";
import { User } from "./types";

const JWT_OPTIONS: SignOptions = {
  algorithm: JWT_ALGORITHM,
  expiresIn: JWT_EXPIRE_TIME,
};

let JWT_SECRET: string;

export async function getJwtSecret(): Promise<string> {
  if (JWT_SECRET === undefined) {
    JWT_SECRET = await getSecretValue("JWT_SECRET");
  }

  return JWT_SECRET
}

export async function createAuthenticationJWT(user: User): Promise<string | boolean> {
  try {
    const secret = await getJwtSecret();
    return jwt.sign({ user }, secret, JWT_OPTIONS);
  } catch (error) {
    logger.error(`createLoginJWT Error: ${error.message}`);
    return false;
  }
}

export async function createAuthenticationPath(user: User): Promise<string | boolean> {
  try {
    const token = await createAuthenticationJWT(user);
    return `${authRoutes.login}?token=${token}`;
  } catch (error) {
    logger.error(`createLoginJWT Error: ${error.message}`);
    return false;
  }
}
