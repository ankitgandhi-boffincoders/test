import express from "express";
import passport from "passport";
import Organization_Controller from "./organization.controller";
export class Organization_Router {
  public router = express.Router();

  constructor() {
    this.config();
  }

  private config(): void {

    this.router.get(
      "/details/:_id",
      passport.authenticate("jwt", { session: false }),
      Organization_Controller.getOrganizationDetails
    );
    this.router.post(
      "/add",
      passport.authenticate("jwt", { session: false }),

      Organization_Controller.addOrganization
    );

    this.router.put(
      "/update",
      passport.authenticate("jwt", { session: false }),
      Organization_Controller.updateOrganization
    );

   
    this.router.get(
      "/",
      passport.authenticate("jwt", { session: false }),
      Organization_Controller.getOrganizationList
    );

    this.router.delete(
      "/delete/:_id",
      passport.authenticate("jwt", { session: false }),
      Organization_Controller.deleteOrganization
    );
   
  }
}
export default new Organization_Router().router;
