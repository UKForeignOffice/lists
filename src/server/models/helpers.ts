import { isNumber, isArray } from "lodash";
import { getDbPool } from "./db/database";
import { CountryName, ServiceType } from "server/models/types";
import { findListByCountryAndType } from "server/models/list";

export const rawInsertGeoLocation = async (
  point: number[]
): Promise<number> => {
  if (!isNumber(point[0]) || !isNumber(point[0])) {
    throw new Error("Invalid points entered");
  }

  const db = getDbPool();
  const result = await db.query(`
    INSERT INTO public."GeoLocation" (location) VALUES ('POINT(${point[0]} ${point[1]})') RETURNING id
  `);

  if (result.rows.length === 0) {
    throw new Error("Unable to insert raw GeoLocation");
  }

  return result.rows[0].id;
};

export function geoPointIsValid(geoPoint: any): boolean {
  return isArray(geoPoint) && isNumber(geoPoint[0]) && isNumber(geoPoint[1]);
}

export async function getListIdForCountryAndType(
  country: CountryName,
  serviceType: ServiceType
): Promise<number> {
  const existingLists = await findListByCountryAndType(
    country,
    serviceType
  );

  return existingLists?.[0]?.id ?? -1;
}

