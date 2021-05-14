import crypto from "crypto";

export const authRoutes = {
  login: "/login",
  logout: "/logout",
};

// TODO: from environment
export const JWT_SECRET = crypto.randomBytes(256).toString("base64");
// TODO: from environment
export const ISSUER = "xxxx";

export const JWT_ALGORITHM = "HS256";
export const JWT_EXPIRE_TIME = "5m";
