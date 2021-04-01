import express from "express";
import { exec } from "child_process";
import { prisma } from "server/models/prisma-client";
import { populateDb } from "server/models/seed-data/populate-database";
import rateLimit from "express-rate-limit";
import {
  createGeoLocationTable,
  createPostgis,
  describeDb,
  // dumpDb,
  listAppliedMigrations,
} from "server/models/helpers";

import {
  LOCATION_SERVICE_ACCESS_KEY,
  LOCATION_SERVICE_SECRET_KEY,
  LOCATION_SERVICE_INDEX_NAME,
} from "config";

const router = express.Router();

const devRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10,
});

router.get("/dev/*", devRateLimit);

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
  createPostgis()
    .then((resultPostgis) => {
      createGeoLocationTable()
        .then((resultsGeoTable) => {
          res.json({ resultPostgis, resultsGeoTable });
        })
        .catch((error) => res.json({ error }));
    })
    .catch((error) => res.json({ error }));
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

// router.get("/dev/dump-db", (req, res) => {
//   dumpDb()
//     .then((result) => {
//       res.json({ result });
//     })
//     .catch((error) => {
//       res.json({ error });
//     });
// });

router.get("/dev/list-applied-migrations", (req, res) => {
  listAppliedMigrations()
    .then((result) => {
      res.json({ result });
    })
    .catch((error) => {
      res.json({ error });
    });
});

router.get("/dev/debug-env", (req, res) => {
  res.json({
    LOCATION_SERVICE_ACCESS_KEY: LOCATION_SERVICE_ACCESS_KEY?.length,
    LOCATION_SERVICE_SECRET_KEY: LOCATION_SERVICE_SECRET_KEY?.length,
    LOCATION_SERVICE_INDEX_NAME: LOCATION_SERVICE_INDEX_NAME?.length,
  });
});

export default router;
