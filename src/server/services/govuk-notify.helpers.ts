import type { ServiceType } from "shared/types";

const listTypeToTypeSingular: Record<ServiceType, string> = {
  covidTestProviders: "covid test provider",
  funeralDirectors: "funeral director",
  lawyers: "lawyer",
  translatorsInterpreters: "translator or interpreter",
};

const listTypeToType: Record<ServiceType, string> = {
  covidTestProviders: "covid test providers",
  funeralDirectors: "funeral directors",
  lawyers: "lawyers",
  translatorsInterpreters: "translators and interpreters",
};

export function getCommonPersonalisations(listType: string, country: string) {
  const serviceType = listType as ServiceType;
  return {
    country,
    typeSingular: listTypeToTypeSingular[serviceType],
    type: listTypeToType[serviceType],
  };
}
