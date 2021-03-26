import express from "express";
import { exec } from "child_process";
import { prisma } from "server/models/prisma-client";
import { populateDb } from "server/models/seed-data/populate-database";
import {
  createGeoLocationTable,
  describeDb,
  dumpDb,
  listAppliedMigrations,
} from "server/models/helpers";
import { logger } from "services/logger";

const router = express.Router();

router.get("/dev/inspect-db", (req, res) => {
  describeDb()
    .then((result) => res.json({ result }))
    .catch((error) => res.json({ error }));
});

router.get("/deploy-db", (req, res) => {
  exec("npm run prisma:deploy", (error, stdout, stderr) => {
    res.json({ error, stdout, stderr });
  });
});

router.get("/dev/prepare-geo-db", (req, res) => {
  const promises = [createGeoLocationTable()];

  Promise.all(promises)
    .then((result) => {
      res.json({ status: result });
    })
    .catch((error) => {
      logger.error(error);
      res.json({ error });
    });
});

router.get("/dev/reset-db", (req, res) => {
  exec("npm run prisma:reset", (error, stdout) => {
    res.json({ error, stdout });
  });
});

router.get("/dev/populate-db", (req, res) => {
  populateDb(prisma)
    .then((result) => {
      res.json({ result });
    })
    .catch((error) => {
      res.json({ error });
    });
});

router.get("/dev/dump-db", (req, res) => {
  dumpDb()
    .then((result) => {
      res.json({ result });
    })
    .catch((error) => {
      res.json({ error });
    });
});

router.get("/dev/list-applied-migrations", (req, res) => {
  listAppliedMigrations()
    .then((result) => {
      res.json({ result });
    })
    .catch((error) => {
      res.json({ error });
    });
});

export default router;
