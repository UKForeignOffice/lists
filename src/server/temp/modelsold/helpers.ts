// import { PrismaClient } from "@prisma/client";
import { upperFirst } from "lodash";
import { logger } from "services/logger";

const countriesWithData = ["Thailand"];

export const countryHasLawyers = (countryName: string): boolean => {
  return countriesWithData.includes(upperFirst(countryName));
};


// type Point = number[];
// export const rawInsertGeoLocation = async (
//   point: Point,
//   prisma: PrismaClient
// ): number | boolean => {
//   try {
//     const result = await prisma.$queryRaw`INSERT INTO public."GeoLocation"(location) VALUES (POINT(${point[0]}, ${point[1]})) RETURNING id`;
//     return result?.[0]?.id ?? false;
//   } catch (error) {
//     logger.error("Insert raw GeoLocation", error);
//     return false;
//   }
// };



// export const createGeoLocationTable = async (prisma: PrismaClient): Promise<void> => {
//   const result = await prisma.$queryRaw`
//     CREATE TABLE "GeoLocation" (
//         "id" SERIAL NOT NULL,
//         "location" geography(POINT),
//         PRIMARY KEY ("id")
//     );
//   `;

//   console.log("XXXXresult", result);
  
// }