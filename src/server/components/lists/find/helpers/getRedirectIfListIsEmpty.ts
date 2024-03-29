import {
  formatCountryParam,
  getCountryFuneralDirectorsRedirectLink,
  getCountryLawyerRedirectLink,
  getCountryTranslatorsInterpretersRedirectLink,
} from "server/components/lists/helpers";
import * as providers from "server/models/listItem/providers";
import type { CountryName } from "server/models/types";
import { ServiceType } from "shared/types";

export async function getRedirectIfListIsEmpty(country: string, serviceType: string) {
  if (!country || !serviceType) {
    return;
  }

  const countryName: string = formatCountryParam(country);
  const countryHasListItems = await providers.some(countryName as CountryName, serviceType as ServiceType);
  if (countryHasListItems) {
    return;
  }

  switch (serviceType) {
    case ServiceType.lawyers:
      return getCountryLawyerRedirectLink(countryName as CountryName);
    case ServiceType.funeralDirectors:
      return getCountryFuneralDirectorsRedirectLink(countryName as CountryName);
    case ServiceType.translatorsInterpreters:
      return getCountryTranslatorsInterpretersRedirectLink(countryName as CountryName);
  }
}
