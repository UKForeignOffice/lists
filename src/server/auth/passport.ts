import passport from "passport";

import {
  ExtractJwt,
  StrategyOptions,
  Strategy as JwtStrategy,
} from "passport-jwt";

import { JWT_SECRET, JWT_ALGORITHM } from "./constants";

const OPTIONS: StrategyOptions = {
  secretOrKey: JWT_SECRET,
  algorithms: [JWT_ALGORITHM],
  jwtFromRequest: ExtractJwt.fromUrlQueryParameter("token"),
};

passport.use(
  "jwt",
  new JwtStrategy(OPTIONS, (token, done) => {
    const { user } = token;

    if (user !== undefined) {
      done(null, user);
    } else {
      done(null, false);
    }
  })
);

passport.serializeUser((user: Express.User, cb) => {
  cb(null, user);
});

passport.deserializeUser((user: Express.User, cb) => {
  cb(null, user);
});

export default passport;
