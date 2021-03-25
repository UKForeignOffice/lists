import express from "express";
import { prisma } from "server/models/prisma-client";
import { populateDb } from "server/models/seed-data/populate-database";
import { createGeoLocationTable } from "server/models/helpers";
import { logger } from "services/logger";
import { DATABASE_URL } from "config";

const router = express.Router();

router.get("/prepare-db", (req, res) => {
  const promises = [createGeoLocationTable()];

  Promise.all(promises)
    .then((result) => {
      res.send({ status: result });
    })
    .catch((error) => {
      logger.error(error);
      res.send({ error });
    });
});

router.get("/populate-db", (req, res) => {
  populateDb(prisma)
    .then((result) => {
      res.send({ result, DATABASE_URL });
    })
    .catch((error) => {
      res.send({ error, DATABASE_URL });
    });
});

export default router;
