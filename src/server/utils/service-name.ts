import { ServiceType } from "shared/types";
import { getServiceTypeName } from "server/components/lists/helpers";

const serviceName = (name: string): string => {
  switch (getServiceTypeName(name)) {
    case ServiceType.covidTestProviders:
      return "COVID-19 test providers";
    case ServiceType.lawyers:
      return "lawyers";
    case ServiceType.funeralDirectors:
      return "funeral directors";
    case ServiceType.translatorsInterpreters:
      return "translators or interpreters";
    default:
      throw new Error("Service name not found");
  }
};

export default serviceName;
