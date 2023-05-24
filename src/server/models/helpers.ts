import { isNumber, isArray } from "lodash";
import { getDbPool } from "./db/database";
import { CountryName, ServiceType } from "server/models/types";
import { findListByCountryAndType } from "server/models/list";
import { prisma } from "shared/prisma";;
import { logger } from "server/services/logger";

/**
 * TODO:- This should really be a tuple of [number, number] but AWS sdk uses a number array..?!s
 */
type Point = [number, number] | number[];

function isValidPoint(point: Point): boolean {
  return isNumber(point[0]) || isNumber(point[1]);
}

export const rawInsertGeoLocation = async (point: Point | number[]): Promise<number> => {
  if (!isValidPoint(point)) {
    logger.warn(`invalid coordinates ${point}`);
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

// eslint-disable-next-line @typescript-eslint/promise-function-async
export const rawUpdateGeoLocation = (id: number, point: Point) => {
  logger.info(`updating geolocation id ${id}, with coordinates ${point}`);

  if (!isValidPoint(point)) {
    logger.warn(`invalid coordinates ${point}`);
    throw new Error("Invalid points entered");
  }

  return prisma.$executeRawUnsafe(
    `UPDATE public."GeoLocation" SET location = ('POINT(${point[0]} ${point[1]})') WHERE id = ${id} RETURNING id`
  );
};

export function geoPointIsValid(geoPoint: any): boolean {
  return isArray(geoPoint) && isNumber(geoPoint[0]) && isNumber(geoPoint[1]);
}

export async function getListIdForCountryAndType(
  country: CountryName,
  serviceType: ServiceType
): Promise<number | undefined> {
  const existingLists = await findListByCountryAndType(country, serviceType);

  return existingLists?.[0]?.id ?? -1;
}
