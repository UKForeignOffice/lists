import jwt, { SignOptions } from "jsonwebtoken";
import { logger } from "server/services/logger";
import { getSecretValue} from "server/services/secrets-manager";
import { User } from "server/models/types";
import { JWT_ALGORITHM, JWT_EXPIRE_TIME } from "./constants";
import { authRoutes } from "./routes";
import { ENVIRONMENT } from "server/config/server-config";

const SECRET_NAME = `JWT_SECRET_${ENVIRONMENT}`;
const JWT_OPTIONS: SignOptions = {
  algorithm: JWT_ALGORITHM,
  expiresIn: JWT_EXPIRE_TIME,
};

let JWT_SECRET: string;

export async function getJwtSecret(): Promise<string> {
  if (JWT_SECRET === undefined) {
    JWT_SECRET = await getSecretValue(SECRET_NAME);
  }

  return JWT_SECRET;
}

export async function createAuthenticationJWT(user: Pick<User, "email">): Promise<string | boolean> {
  try {
    const secret = await getJwtSecret();
    return jwt.sign({ user }, secret, JWT_OPTIONS);
  } catch (error) {
    logger.error(`createLoginJWT Error: ${error.message}`);
    throw error;
  }
}

export async function createAuthenticationPath(user: Pick<User, "email">): Promise<string | boolean> {
  try {
    const token = await createAuthenticationJWT(user);
    return `${authRoutes.loginAuth.replace(":token", `${token}`)}`;
  } catch (error) {
    logger.error(`createLoginJWT Error: ${error.message}`);
    throw error;
  }
}
