// import { prisma } from "./prisma-client";


// initially resutls will always be sorted per distance
// export function fetchLawyers(props: { country: string }) {
//   const result = await prisma.$queryRaw`
//     SELECT * FROM public."Lawyer" as lawyer
//     INNER JOIN public."Address" as address
//       ON lawyer.addressId = address.id
//     INNER JOIN public."Country" as country
//       ON address.countryId = country.id
//     INNER JOIN public."GeoLocation"(location) as geo
//       ON address.geoLocationId = geo.id
//     WHERE country.name = ${props.country}
//   `;

//   const results = prisma.$queryRaw
// }



// INSERT INTO public."GeoLocation"(location) VALUES (point(51.53087100068205, -0.12497110071057951))

// SELECT * FROM public."Lawyer" L
// INNER JOIN public."Address" A ON L.addressId = A.id
// INNER JOIN public."Country" C ON A.countryId = C.id
// INNER JOIN public."GeoLocation"(location) G ON A.geoLocationId = G.id
// WHERE C.name = Thailand


// SELECT 
// 	*,
// 	ST_DistanceSphere(
// 		g.location,
// 		POINT(100.68116292513251, 13.826734625778284)
// 	) AS distance	
// FROM public."Lawyer" AS l
// INNER JOIN public."Address" AS a ON l."addressId" = a.id
// INNER JOIN public."Country" AS c ON a."countryId" = c.id
// INNER JOIN public."GeoLocation" AS g ON a."geoLocationId" = g.id
// WHERE c.name = 'Thailand'
// ORDER BY g.location <-> POINT(37.611100, 55.756926) ASC
// -- ORDER BY ST_Distance_Sphere(g.location, POINT(100.68116292513251, 13.826734625778284)) ASC


// WHERE ST_Distance_Sphere(the_geom, ST_MakePoint(your_lon,your_lat)) <= radius_mi * 1609.34