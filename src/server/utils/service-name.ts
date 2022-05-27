import { ServiceType } from "server/models/types";

const serviceName = (name: string): string => {
  switch (name) {
    case ServiceType.covidTestProviders:
      return "COVID-19 test providers";
    case ServiceType.lawyers:
      return "lawyers";
    case ServiceType.funeralDirectors:
      return "funeral directors";
    default:
      throw new Error("Service name not found");
  }
};

export default serviceName;
