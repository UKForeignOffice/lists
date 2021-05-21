import jwt, { SignOptions } from "jsonwebtoken";
import { logger } from "server/services/logger";
import {
  JWT_ISSUER,
  JWT_SECRET,
  JWT_ALGORITHM,
  JWT_EXPIRE_TIME,
  authRoutes,
} from "./constants";
import { User } from "./types";

const JWT_OPTIONS: SignOptions = {
  issuer: JWT_ISSUER,
  algorithm: JWT_ALGORITHM,
  expiresIn: JWT_EXPIRE_TIME,
};

export function createAuthenticationJWT(user: User): string | boolean {
  try {
    return jwt.sign({ user }, `${JWT_SECRET}`, JWT_OPTIONS);
  } catch (error) {
    logger.error(`createLoginJWT Error: ${error.message}`);
    return false;
  }
}

export function createAuthenticationPath(user: User): string | boolean {
  return `${authRoutes.login}?token=${createAuthenticationJWT(user)}`;
}
