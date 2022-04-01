import * as express from "express";
import passport from "passport";
import CertificateController from "../common/certificate/certificate.controller";
import UploadController from "../common/upload/upload_media.controller";
import Employee_Router from "../contoller-services/employee-management/employee/employee.route";
import Leave_Router from "../contoller-services/employee-management/leave/leave.route";
import Organization_Router from "../contoller-services/employee-management/organization/organization.routes";
import Profile_Router from "../contoller-services/employee-management/profile/profile.routes";
import Feedback_Router from "../contoller-services/feedback/feedback.routes";
import Applicant_Router from "../contoller-services/hr-management/applicants/applicant.routes";
import Department_Router from "../contoller-services/hr-management/department/department.routes";
import Inventory_Router from "../contoller-services/hr-management/inventory/inventory.routes";

class MainRoutes {
  public router = express.Router();

  constructor() {
    this.config();
  }

  private config(): void {
    this.router.use("/employee", Employee_Router);
    this.router.use("/organization", Organization_Router);
    this.router.use("/leave", Leave_Router);
    this.router.use("/inventory", Inventory_Router);
    this.router.use("/feedback", Feedback_Router);
    this.router.use("/applicant", Applicant_Router);
    this.router.use("/profile", Profile_Router);
    this.router.use("/department", Department_Router);

    this.router.post(
      "/upload_media",
      passport.authenticate("jwt", { session: false }),
      UploadController.uploadMedia
    );
    this.router.post(
      "/upload/?:folder",
      passport.authenticate("jwt", { session: false }),
      UploadController.uploadResourcesToCloudinary
    );
    this.router.post(
      "/certificate",
      passport.authenticate("jwt", { session: false }),
      CertificateController.certificate
    );
    this.router.delete(
      "/delete",
      passport.authenticate("jwt", { session: false }),
      UploadController.deleteResoucesFromCloudinary
    );
    
  }
}

export default new MainRoutes().router;
