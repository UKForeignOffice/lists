import express from "express";
import { exec } from "child_process";
import rateLimit from "express-rate-limit";
import { listAppliedMigrations } from "server/models/helpers";
import { populateDb } from "server/models/db/helpers";
import { isLocalHost, GOVUK_NOTIFY_API_KEY } from "server/config";
import { createUser } from "server/models/user";
import { UserRoles } from "server/models/types";

const router = express.Router();

const devRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10,
});

if (!isLocalHost) {
  router.get("/dev/*", devRateLimit);
}

router.get("/dev/reset-db", (req, res) => {
  req.setTimeout(5 * 60 * 1000);

  exec("npm run prisma:reset", () => {
    populateDb()
      .then((results) => {
        res.send({ results });
      })
      .catch((error) => {
        res.send({ error });
      });
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

router.get("/dev/list-env-names", (req, res) => {
  function isUpperCase(str: string): boolean {
    return str === str.toUpperCase();
  }
  const keys = Object.keys(process.env).filter(isUpperCase).join(", ");

  res.json({
    keys,
    HOSTNAME: process.env.HOSTNAME,
    LISTS_SERVICE_HOST: process.env.LISTS_SERVICE_HOST,
  });
});

router.get("/dev/create-super-admin", (req, res) => {
  const { email, key } = req.query;

  if (
    req.isAuthenticated() &&
    typeof email === "string" &&
    key === GOVUK_NOTIFY_API_KEY
  ) {
    createUser({
      email,
      jsonData: {
        roles: [UserRoles.SuperAdmin],
      },
    })
      .then(() => {
        res.send("OK");
      })
      .catch((error: Error) => {
        res.status(500).send({ error });
      });
  }
});

export default router;
