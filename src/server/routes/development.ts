import { exec } from "child_process";
import express, { Request, Response } from "express";
import { UserRoles } from "server/models/types";
import { GOVUK_NOTIFY_API_KEY } from "server/config";
import { dashboardRoutes } from "server/components/dashboard";
import { createUser, updateUser, findUserByEmail } from "server/models/user";

export const router = express.Router();

router.get(`${dashboardRoutes.start}/dev/reset-db`, (req, res) => {
  exec("npm run prisma:reset", (error, stdout, stderr) => {
    res.send({ error, stdout, stderr });
  });
});

router.get(`${dashboardRoutes.start}/dev/deploy-db`, (req, res) => {
  req.setTimeout(5 * 60 * 1000);

  exec("npm run prisma:deploy", (error, stdout, stderr) => {
    if (error !== null) {
      res.send(error);
    } else if (stderr.length > 0) {
      res.send(stderr);
    } else {
      res.send(stdout);
    }
  });
});

// TODO: DEPRECATE once application is deployed in production environment
async function promoteUser(req: Request, res: Response): Promise<void> {
  const { email, key } = req.query;

  if (
    typeof email === "string" &&
    typeof key === "string" &&
    key?.length > 10 &&
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
