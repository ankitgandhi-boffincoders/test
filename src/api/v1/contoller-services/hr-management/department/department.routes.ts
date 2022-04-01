import express from "express";
import passport from "passport";
import DepartmentController from "./department.controller";
export class Department_Router {
  public router = express.Router();

  constructor() {
    this.config();
  }

  private config(): void {
    this.router.post(
      "/",
      passport.authenticate("jwt", { session: false }),
      DepartmentController.addDepartment
    );

    this.router.put(
      "/",
      passport.authenticate("jwt", { session: false }),
      DepartmentController.updateDepartment
    );

    this.router.get(
      "/details/:_id",
      passport.authenticate("jwt", { session: false }),
      DepartmentController.getDepartmentDetails
    );

    this.router.get(
      "/:organization_id",
      passport.authenticate("jwt", { session: false }),
      DepartmentController.listAllDepartment)

    this.router.delete(
      "/:_id",
      passport.authenticate("jwt", { session: false }),
      DepartmentController.deleteDepartment
    );
  }
}
export default new Department_Router().router;
