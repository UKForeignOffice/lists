import express from "express";
import { exec } from "child_process";
import { listAppliedMigrations } from "server/models/helpers";
import { populateDb } from "server/models/db/helpers";
import { GOVUK_NOTIFY_API_KEY } from "server/config";
import { createUser } from "server/models/user";
import { UserRoles } from "server/models/types";
import { dashboardRoutes } from "server/controllers/dashboard";

const router = express.Router();

router.get(`${dashboardRoutes.start}/dev/reset-db`, (req, res) => {
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

router.get(
  `${dashboardRoutes.start}/dev/list-applied-migrations`,
  (req, res) => {
    listAppliedMigrations()
      .then((result) => {
        res.json({ result });
      })
      .catch((error) => {
        res.json({ error });
      });
  }
);

router.get(`${dashboardRoutes.start}/dev/list-env-names`, (req, res) => {
  function isUpperCase(str: string): boolean {
    return str === str.toUpperCase();
  }

  const keys = Object.keys(process.env).filter(isUpperCase).join(", ");
  res.json({ keys });
});

router.get(`${dashboardRoutes.start}/dev/create-super-admin`, (req, res) => {
  const { email, key } = req.query;

  if (
    typeof email === "string" &&
    (GOVUK_NOTIFY_API_KEY ?? "").includes(`${key}`)
  ) {
    createUser({
      email: `${email}`,
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
