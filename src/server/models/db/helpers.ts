import { db } from "./database";
import { logger } from "server/services/logger";

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
