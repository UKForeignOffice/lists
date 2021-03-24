import express from "express";
// import { prisma } from "../modelsold/prisma-client";
// import { populateDb } from "server/modelsold/data/populate-database";
// import { createGeoLocationTable } from "server/modelsold/helpers";
import { logger } from "services/logger";

import { db } from "server/models";

const router = express.Router();

router.get("/prepare-db", (req, res) => {
  console.log(db)
})

// router.get("/prepare-db", (req, res) => {
//   const promises = [createGeoLocationTable(prisma)];

//   Promise.all(promises)
//     .then(() => {
//       res.send({ status: "OK" });
//     })
//     .catch((error) => {
//       logger.error(error);
//       res.send({ error });
//     });
  
// });

// router.get("/populate-db", (req, res) => {
//   populateDb(prisma)
//     .then((result) => {
//       res.send({ result });
//     })
//     .catch((error) => {
//       res.send({ error });
//     });
// });

export default router;
