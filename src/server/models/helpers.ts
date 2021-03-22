import { upperFirst } from "lodash";

const countriesWithData = ["Thailand"];

export const countryHasLawyers = (countryName: string): boolean => {
  return countriesWithData.includes(upperFirst(countryName));
};
