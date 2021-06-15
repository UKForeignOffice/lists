import { Express } from "express";
import passport from "passport";
import {
  ExtractJwt,
  StrategyOptions,
  Strategy as JwtStrategy,
} from "passport-jwt";
import { getJwtSecret } from "./json-web-token";
import { User } from "server/models/types";
import { findUserByEmail, createUser } from "server/models/user";
import { AuthenticatedUser } from "./authenticated-user";

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

      logger.info(`JwtStrategy will try to find user ${JSON.stringify(user)}`);

      if (user.email !== undefined) {
        let userData = await findUserByEmail(user.email);
        logger.info(`JwtStrategy findUserByEmail ${JSON.stringify(userData)}`);

        if (userData === undefined) {
          logger.info(`JwtStrategy will create user ${JSON.stringify(user)}`);
          userData = await createUser({
            email: user.email,
            jsonData: {
              roles: [],
            },
          });
          logger.info(`JwtStrategy created user ${JSON.stringify(userData)}`);
        }

        done(null, userData);
      } else {
        logger.info(`JwtStrategy failed to login user ${JSON.stringify(user)}`);
        done(null, false);
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
