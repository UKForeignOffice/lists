import { logger } from "../logger";
import { countriesList } from "../../../server/services/metadata";

export default function getCountryCodeFromCountryName(countryName: string): string | undefined {
  if (!countryName) {
    logger.error("getCountryCodeFromCountryName: Country name not found");
  }

  const selectedCountry = countriesList.find(
    (countryData) => countryData.text.toLowerCase() === countryName.toLowerCase()
  );

  return selectedCountry?.code;
}
