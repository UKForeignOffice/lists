import { HttpException } from "server/middlewares/error-handlers";

export function getStringRouteParam(params: Record<string, unknown>, name: string): string {
  const value = params[name];
  if (typeof value !== "string") {
    throw new HttpException(400, "400", `Route parameter "${name}" must be a single string.`);
  }

  return value;
}
