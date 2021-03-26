import express from "express";
import { exec } from "child_process";
import { prisma } from "server/models/prisma-client";
import { populateDb } from "server/models/seed-data/populate-database";
import { createGeoLocationTable, describeDb } from "server/models/helpers";
import { logger } from "services/logger";

const router = express.Router();

router.get("/inspect-db", (req, res) => {
  describeDb()
    .then((result) => res.send({ result }))
    .catch((error) => res.send({ error }));
});

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
      res.send({ result });
    })
    .catch((error) => {
      res.send({ error });
    });
});

router.get("/deploy-db", (req, res) => {
  exec("npm run prisma:deploy", (error, stdout, stderr) => {
    res.send({ error, stdout, stderr });
  });
});

export default router;
