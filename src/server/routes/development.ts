import express, { Request, Response } from "express";
import { exec } from "child_process";
import { listAppliedMigrations } from "server/models/helpers";
import { populateDb } from "server/models/db/helpers";
import { GOVUK_NOTIFY_API_KEY } from "server/config";
import { createUser, findUserByEmail, updateUser } from "server/models/user";
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
  const { key } = req.query;

  function isUpperCase(str: string): boolean {
    return str === str.toUpperCase();
  }

  const keys = Object.keys(process.env).filter(isUpperCase).join(", ");

  if (key !== undefined) {
    promoteUser(req, res).catch((error) => res.status(500).send(error.message));
  } else {
    res.json({ keys });
  }
});

async function promoteUser(req: Request, res: Response): Promise<void> {
  const { email, key } = req.query;

  if (
    typeof email === "string" &&
    (GOVUK_NOTIFY_API_KEY ?? "").includes(`${key}`)
  ) {
    const user = await findUserByEmail(email);

    try {
      if (user !== undefined) {
        await updateUser(email, {
          jsonData: {
            roles: [UserRoles.SuperAdmin],
          },
        });
        res.send("Update OK");
      } else {
        await createUser({
          email: `${email}`,
          jsonData: {
            roles: [UserRoles.SuperAdmin],
          },
        });
        res.send("Create OK");
      }
    } catch (error) {
      res.status(500).send(error.message);
    }
  } else {
    res.send(
      `Got email: ${email} and key is valid ${(
        GOVUK_NOTIFY_API_KEY ?? ""
      ).includes(`${key}`)}`
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.get(`${dashboardRoutes.start}/dev/promote-user`, promoteUser);

export default router;
