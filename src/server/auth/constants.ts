export { JWT_SECRET, JWT_ISSUER } from "server/config";
export const JWT_ALGORITHM = "HS256";
export const JWT_EXPIRE_TIME = "5m";
export const authRoutes = {
  login: "/login",
  logout: "/logout",
};
