import express from "express";
import passport from "passport";
import Profile_Controller from "./profile.controller";
export class Profile_Router {
  public router = express.Router();

  constructor() {
    this.config();
  }

  private config(): void {
    this.router.post(
      "/add",
      passport.authenticate("jwt", { session: false }),
      Profile_Controller.addProfile
    );
    this.router.put(
      "/update",
      passport.authenticate("jwt", { session: false }),
      Profile_Controller.updateProfile
    );
    this.router.delete(
      "/delete/:_id",
      passport.authenticate("jwt", { session: false }),
      Profile_Controller.deleteProfile
    );
    this.router.get(
      "/",
      passport.authenticate("jwt", { session: false }),
      Profile_Controller.listAllProfile
    );
    this.router.get(
      "/:_id",
      passport.authenticate("jwt", { session: false }),
      Profile_Controller.getProfileDetails
    );
  }
}
export default new Profile_Router().router;
