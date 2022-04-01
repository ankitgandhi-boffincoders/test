import Passport from "passport";
import { ExtractJwt, Strategy, StrategyOptions } from "passport-jwt";
import empoyeeModel from "../../models/employee-management-models/employee.model";

let jwtStrategyOptions: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  issuer:process.env.JWT_TOKEN_ISSUER,
  ignoreExpiration: false,
  audience: process.env.JWT_AUDIENCE || "",
  jsonWebTokenOptions: {
    complete: true,
    ignoreExpiration: false,
  },
  secretOrKey:process.env.JWT_TOKEN_SECRET||'',
};

export const strategy = (passport: typeof Passport) =>
  passport.use(
    new Strategy(jwtStrategyOptions, async (jwt_payload, done) => {
      
      let foundUser = await empoyeeModel.findOne({
        _id: jwt_payload.payload.user_id,
      });
      if (foundUser) return done(null, foundUser, jwt_payload);
      else return done(null, false, false);
    })
  );
