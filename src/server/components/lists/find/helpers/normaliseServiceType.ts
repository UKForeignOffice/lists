import { kebabCase } from "lodash";

export function normaliseServiceType(serviceType: string) {
  return kebabCase(serviceType).toLowerCase();
}
