import { upperFirst, isNumber } from "lodash";
import { logger } from "server/services/logger";
import { db } from "./db/database";
import { CountriesWithData, CountryName } from "./types";

const countriesWithData: CountriesWithData[] = [
  "Thailand",
  "France",
  "Italy",
  "Spain",
];

export const countryHasLawyers = (countryName: CountryName): boolean => {
  return countriesWithData.includes(
    upperFirst(countryName) as CountriesWithData
  );
};

export const rawInsertGeoLocation = async (
  point: number[]
): Promise<number | boolean> => {
  try {
    if (!isNumber(point[0]) || !isNumber(point[0])) {
      // make sure these are number to avoid sql injection
      return false;
    }

    const result = await db.query(`
      INSERT INTO public."GeoLocation" (location) VALUES ('POINT(${point[0]} ${point[1]})') RETURNING id
    `);

    return result?.rows?.[0]?.id ?? false;
  } catch (error) {
    logger.error("Insert raw GeoLocation", error);
    return false;
  }
};

export const createPostgis = async (): Promise<"OK" | string> => {
  const createPostGisExtension = "CREATE EXTENSION postgis;";

  try {
    await db.query(createPostGisExtension);
    return "postgis extension OK";
  } catch (error) {
    logger.error("createPostgis extension error:", error);
    return error;
  }
};

export const createGeoLocationTable = async (): Promise<"OK" | string> => {
  const createGeoTable = `
     CREATE TABLE public."GeoLocation" (
        "id" SERIAL NOT NULL,
        "location" geography(POINT),
        PRIMARY KEY ("id")
     );
  `;

  try {
    await db.query(createGeoTable);
    return "GeoLocation created successfully";
  } catch (error) {
    logger.error("createGeoLocationTable error:", error);
    return error;
  }
};

export const describeDb = async (): Promise<any> => {
  const query = `
    SELECT table_schema,table_name FROM information_schema.tables
    ORDER BY table_schema,table_name;
  `;

  try {
    const result = await db.query(query);
    return result;
  } catch (error) {
    logger.error("describeDb error:", error);
    return error;
  }
};

export const dumpDb = async (): Promise<any> => {
  const lawyersQuery = 'SELECT * from "Lawyer"';
  const addressQuery = 'SELECT * from "Address"';
  const geoQuery = 'SELECT * from "GeoLocation"';
  const countryQuery = 'SELECT * from "Country"';

  try {
    const lawyers = await db.query(lawyersQuery);
    const address = await db.query(addressQuery);
    const geo = await db.query(geoQuery);
    const country = await db.query(countryQuery);
    return { lawyers, address, geo, country };
  } catch (error) {
    logger.error("dumpDb error:", error);
    return error;
  }
};

export const listAppliedMigrations = async (): Promise<any> => {
  const query = "SELECT * from _prisma_migrations";

  try {
    const { rows } = await db.query(query);
    return { migrations: rows };
  } catch (error) {
    logger.error("listAppliedMigrations error:", error);
    return error;
  }
};
