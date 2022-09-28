/* eslint-disable @typescript-eslint/no-misused-promises */
import { exec } from "child_process";
import { Request, Response } from "express";
import { UserRoles } from "server/models/types";
import { GOVUK_NOTIFY_API_KEY } from "server/config";
import { createUser, updateUser, findUserByEmail } from "server/models/user";

export function deployDb(req: Request, res: Response): void {
  req.setTimeout(5 * 60 * 1000);

  exec("npm run prisma:deploy", (error, stdout, stderr) => {
    res.send({ error, stdout, stderr });
  });
}

export function resetDb(req: Request, res: Response): void {
  exec("npm run prisma:reset", (error, stdout, stderr) => {
    res.send({ error, stdout, stderr });
  });
}

export async function promoteUser(req: Request, res: Response): Promise<void> {
  // TODO: limit this to localhost only once we have a production server set up
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
      res.status(500).send((error as Error).message);
    }
  } else {
    res.send(
      `Got email: ${email} and key is valid ${(
        GOVUK_NOTIFY_API_KEY ?? ""
      ).includes(`${key}`)}`
    );
  }
}
