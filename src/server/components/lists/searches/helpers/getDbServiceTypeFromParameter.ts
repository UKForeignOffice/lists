import { ServiceType } from "shared/types";

export function getDbServiceTypeFromParameter(param: string) {
  const normalisedParameterToServiceType: { [key: string]: ServiceType } = {
    "funeral-directors": ServiceType.funeralDirectors,
    lawyers: ServiceType.lawyers,
    "translators-interpreters": ServiceType.translatorsInterpreters,
  };

  return normalisedParameterToServiceType[param];
}
