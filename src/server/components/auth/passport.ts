import { Express } from "express";
import passport from "passport";
import { ExtractJwt, StrategyOptions, Strategy as JwtStrategy } from "passport-jwt";
import { getJwtSecret } from "./json-web-token";
import { User } from "server/models/types";
import { findUserByEmail, createUser } from "server/models/user";
import AuthenticatedUser from "./authenticated-user";

import { JWT_ALGORITHM } from "./constants";
import { logger } from "server/services/logger";

export async function configurePassport(server: Express): Promise<void> {
  const JWT_SECRET = await getJwtSecret();
  const OPTIONS: StrategyOptions = {
    secretOrKey: JWT_SECRET,
    algorithms: [JWT_ALGORITHM],
    jwtFromRequest: ExtractJwt.fromUrlQueryParameter("token"),
  };

  passport.use(
    "jwt",
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    new JwtStrategy(OPTIONS, async (token, done) => {
      const { user } = token;

      if (user?.email === undefined) {
        logger.warn(`JwtStrategy token is invalid for user ${JSON.stringify(user)}`);
        done(new Error("Invalid authentication token"));
      } else {
        let userData = await findUserByEmail(user.email);

        if (userData === undefined) {
          userData = await createUser({
            email: user.email,
            jsonData: {
              roles: [],
            },
          });
        }

        // @ts-ignore
        done(null, userData);
      }
    })
  );

  passport.serializeUser((user, cb) => {
    // from jwt to session
    cb(null, user);
  });

  passport.deserializeUser((userData: User, cb) => {
    // from session to req.user
    cb(null, new AuthenticatedUser(userData));
  });

  server.use(passport.initialize());
  server.use(passport.session());
}

export default passport;
