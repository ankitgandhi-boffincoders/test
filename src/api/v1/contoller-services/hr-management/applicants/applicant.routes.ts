import express from "express";
import passport from "passport";
import Applicant_Controller from "./applicant.controller";
export class Applicant_Router {
  public router = express.Router();

  constructor() {
    this.config();
  }

  private config(): void {
    this.router.post(
      "/add",
      passport.authenticate("jwt", { session: false }),
      Applicant_Controller.addApplicant
    );

    this.router.put(
      "/update",
      passport.authenticate("jwt", { session: false }),
      Applicant_Controller.updateApplicant
    );

    this.router.get(
      "/details/:_id",
      passport.authenticate("jwt", { session: false }),
      Applicant_Controller.getApplicantDetails
    );

    this.router.get(
      "/",
      passport.authenticate("jwt", { session: false }),
      Applicant_Controller.listAllApplicant
    );

    this.router.delete(
      "/:_id",
      passport.authenticate("jwt", { session: false }),
      Applicant_Controller.deleteApplicant
    );
  }
}
export default new Applicant_Router().router;
