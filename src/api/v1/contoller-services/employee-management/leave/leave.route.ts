import express from "express";
import passport from "passport";
import LeaveController from "../leave/leave.controller";
export class Leave_Router {
  public router = express.Router();

  constructor() {
    this.config();
  }

  private config(): void {
    this.router.post(
      "/add",
      passport.authenticate("jwt", { session: false }),
      LeaveController.addLeave
    );

    this.router.put(
      "/update",
      passport.authenticate("jwt", { session: false }),
      LeaveController.updateLeave
    );

    this.router.delete(
      "/delete/:_id",
      passport.authenticate("jwt", { session: false }),
      LeaveController.deleteLeave
    );
       
    this.router.get(
      "/leave_details/:_id",
      passport.authenticate("jwt", { session: false }),
      LeaveController.GetLeaveDetails
    );
    this.router.get(
      "/",
      passport.authenticate("jwt", { session: false }),
      LeaveController.leaveList
    );
    this.router.get(
      "/leave_list/:employee_id",
      passport.authenticate("jwt", { session: false }),
      LeaveController.LeaveListByAdmin
    );
    
    // we  check with token that only a manager can approve or reject a leave request
    this.router.put(
      "/change_status",
      passport.authenticate("jwt", { session: false }),

      LeaveController.approveLeaveOrRejectLeave
    );
    this.router.put(
      "/upload/leave_attachment",
      passport.authenticate("jwt", { session: false }),

      LeaveController.uploadLeaveAttachment
    );
    this.router.get(
      "/history/:employee_id",
      passport.authenticate("jwt", { session: false }),

      LeaveController.leaveHistory
    );
    this.router.get(
      "/history_all_employee/:organization_id",
      passport.authenticate("jwt", { session: false }),

      LeaveController.leaveHistoryAllEmployee
    );
    this.router.post(
      "/type",
      passport.authenticate("jwt", { session: false }),
      LeaveController.addLeaveType
    );

    this.router.put(
      "/type",
      passport.authenticate("jwt", { session: false }),
      LeaveController.updateLeaveType
    );

    this.router.delete(
      "/type/:leave_type_id",
      passport.authenticate("jwt", { session: false }),
      LeaveController.deleteLeaveType
    );
    
    this.router.get(
      "/type/:leave_type_id",
      passport.authenticate("jwt", { session: false }),
      LeaveController.getLeaveType
    );
    this.router.get(
      "/type",
      passport.authenticate("jwt", { session: false }),
      LeaveController.allLeaveTypeList
    );

    this.router.post(
      "/status",
      passport.authenticate("jwt", { session: false }),
      LeaveController.addLeaveStatus
    );
    
    this.router.get(
      "/status/:leave_status_id",
      passport.authenticate("jwt", { session: false }),
      LeaveController.GetLeaveStatus
    );
    this.router.put(
      "/status",
      passport.authenticate("jwt", { session: false }),
      LeaveController.updateLeaveStatus
    );

    this.router.delete(
      "/status/:leave_status_id",
      passport.authenticate("jwt", { session: false }),
      LeaveController.deleteLeaveStatus
    );
    this.router.get(
      "/status",
      passport.authenticate("jwt", { session: false }),
      LeaveController.allLeaveStatusList
    );

    this.router.post(
      "/reason",
      passport.authenticate("jwt", { session: false }),
      LeaveController.addLeaveReason
    );

    this.router.put(
      "/reason",
      passport.authenticate("jwt", { session: false }),
      LeaveController.updateLeaveReason
    );

    this.router.delete(
      "/reason/:leave_reason_id",
      passport.authenticate("jwt", { session: false }),
      LeaveController.deleteLeaveReason
    );
    this.router.get(
      "/reason",
      passport.authenticate("jwt", { session: false }),
      LeaveController.allLeaveReasonList
    );
    //Leave Deduction category
    this.router.get(
      "/deduction_category",
      passport.authenticate("jwt", { session: false }),
      LeaveController.AllLeaveDeductionCategoryList
    );

    this.router.get(
      "/deduction/category/:_id",
      passport.authenticate("jwt", { session: false }),
      LeaveController.getLeaveDeductionCategoryDetails
    );
    
    this.router.post(
      "/deduction_category",
      passport.authenticate("jwt", { session: false }),
      LeaveController.AddLeaveDeductionCategory
    );
    this.router.put(
      "/deduction_category",
      passport.authenticate("jwt", { session: false }),
      LeaveController.UpdateLeaveDeductionCategory
    );
    this.router.delete(
      "/deduction_category/:_id",
      passport.authenticate("jwt", { session: false }),
      LeaveController.DeleteLeaveDeductionCategory
    );
  }
}
export default new Leave_Router().router;
