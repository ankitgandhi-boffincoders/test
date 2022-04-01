import { NextFunction, Request, Response } from "express";
import HttpStatus from "http-status-codes";
import Utility, { ValidationResult } from "../../../common/common-methods";
import {
  AddLeaveReasonAttachmentViewmodel,
  AddLeaveViewmodel,
  DeleteLeaveRequestViewmodel,
  GetLeaveDetailsViewmodel,
  GetLeaveListByAdminViewmodel,
  LeaveApprovalViewmodel,
  LeaveHistoryAllEmployeeViewmodel,
  LeaveHistoryViewmodel,
  UpdateLeaveViewmodel
} from "../../../view-models/employee-management-viewmodels/leave";
import {
  AddLeaveDeductionCategoryViewmodel,
  DeleteLeaveDeductionCategoryViewmodel,
  GetLeaveDeductionCategoryViewmodel,
  UpdateLeaveDeductionCategoryViewmodel
} from "../../../view-models/employee-management-viewmodels/leave/leave-deduction/index";
import {
  AddLeaveReasonViewmodel,
  DeleteLeaveReasonViewmodel,
  UpdateLeaveReasonViewmodel
} from "../../../view-models/employee-management-viewmodels/leave/leave-reason";
import {
  AddLeaveStatusViewmodel,
  DeleteLeaveStatusViewmodel,
  UpdateLeaveStatusViewmodel
} from "../../../view-models/employee-management-viewmodels/leave/leave-status";
import {
  AddLeaveTypeViewmodel,
  DeleteLeaveTypeViewmodel,
  GetLeaveTypeDetailsViewmodel,
  UpdateLeaveTypeViewmodel
} from "../../../view-models/employee-management-viewmodels/leave/leave-type/index";
import leaveService from "../leave/leave.service";

class Leave_Controller {
  //Request Leave
  public addLeave = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let conversionResult: ValidationResult = await Utility.ValidateAndConvert(
        AddLeaveViewmodel,
        req.body
      );

      if (conversionResult.error && conversionResult.error.length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          status_code: HttpStatus.BAD_REQUEST,
          success: false,
          errors: conversionResult.error,
        });
      } else {
        let model: AddLeaveViewmodel =
          conversionResult.data as AddLeaveViewmodel;
        let leaveResult = await leaveService.AddLeave(req, model);
        if (leaveResult && leaveResult.status_code === HttpStatus.OK)
          return res.status(leaveResult.status_code).json({
            status_code: leaveResult.status_code,
            success: true,
            data: leaveResult.data,
          });
        else
          return res.status(leaveResult.status_code).json({
            status_code: leaveResult.status_code,
            success: false,
            errors: [leaveResult.data],
          });
      }
    } catch (error) {
      next(error);
    }
  };
  public updateLeave = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let conversionResult: ValidationResult = await Utility.ValidateAndConvert(
        UpdateLeaveViewmodel,
        req.body
      );

      if (conversionResult.error && conversionResult.error.length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          status_code: HttpStatus.BAD_REQUEST,
          success: false,
          errors: conversionResult.error,
        });
      } else {
        let model: UpdateLeaveViewmodel =
          conversionResult.data as UpdateLeaveViewmodel;
        let leaveResult = await leaveService.UpdateLeave(req, model);
        if (leaveResult && leaveResult.status_code === HttpStatus.OK)
          return res.status(leaveResult.status_code).json({
            status_code: leaveResult.status_code,
            success: true,
            data: leaveResult.data,
          });
        else
          return res.status(leaveResult.status_code).json({
            status_code: leaveResult.status_code,
            success: false,
            errors: [leaveResult.data],
          });
      }
    } catch (error) {
      next(error);
    }
  };
  public deleteLeave = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let conversionResult: ValidationResult = await Utility.ValidateAndConvert(
        DeleteLeaveRequestViewmodel,
        JSON.parse(`{"_id":"${req.params._id}"}`)
      );

      if (conversionResult.error && conversionResult.error.length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          status_code: HttpStatus.BAD_REQUEST,
          success: false,
          errors: conversionResult.error,
        });
      } else {
        let leaveResult = await leaveService.DeleteLeave(req);
        if (leaveResult && leaveResult.status_code === HttpStatus.OK)
          return res.status(leaveResult.status_code).json({
            status_code: leaveResult.status_code,
            success: true,
            data: leaveResult.data,
          });
        else
          return res.status(leaveResult.status_code).json({
            status_code: leaveResult.status_code,
            success: false,
            errors: [leaveResult.data],
          });
      }
    } catch (error) {
      next(error);
    }
  };

  public GetLeaveDetails = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let conversionResult: ValidationResult = await Utility.ValidateAndConvert(
        GetLeaveDetailsViewmodel,
        JSON.parse(`{"_id":"${req.params._id}"}`)
      );

      if (conversionResult.error && conversionResult.error.length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          status_code: HttpStatus.BAD_REQUEST,
          success: false,
          errors: conversionResult.error,
        });
      } else {
        let leaveResult = await leaveService.GetLeaveDetails(req);
        if (leaveResult && leaveResult.status_code === HttpStatus.OK)
          return res.status(leaveResult.status_code).json({
            status_code: leaveResult.status_code,
            success: true,
            data: leaveResult.data,
          });
        else
          return res.status(leaveResult.status_code).json({
            status_code: leaveResult.status_code,
            success: false,
            errors: [leaveResult.data],
          });
      }
    } catch (error) {
      next(error);
    }
  };

  public approveLeaveOrRejectLeave = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let conversionResult: ValidationResult = await Utility.ValidateAndConvert(
        LeaveApprovalViewmodel,
        req.body
      );

      if (conversionResult.error && conversionResult.error.length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          status_code: HttpStatus.BAD_REQUEST,
          success: false,
          errors: conversionResult.error,
        });
      } else {
        let model: LeaveApprovalViewmodel =
          conversionResult.data as LeaveApprovalViewmodel;

        let leaveApprovalResult = await leaveService.ApproveLeaveOrRejectLeave(
          req,
          model
        );
        if (
          leaveApprovalResult &&
          leaveApprovalResult.status_code === HttpStatus.OK
        )
          return res.status(leaveApprovalResult.status_code).json({
            status_code: leaveApprovalResult.status_code,
            success: true,
            data: leaveApprovalResult.data,
          });
        else
          return res.status(leaveApprovalResult.status_code).json({
            status_code: leaveApprovalResult.status_code,
            success: false,
            errors: [leaveApprovalResult.data],
          });
      }
    } catch (error) {
      next(error);
    }
  };
  public leaveHistory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let conversionResult: ValidationResult = await Utility.ValidateAndConvert(
        LeaveHistoryViewmodel,
        JSON.parse(`{"employee_id":"${req.params.employee_id}"}`)
      );

      if (conversionResult.error && conversionResult.error.length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          status_code: HttpStatus.BAD_REQUEST,
          success: false,
          errors: conversionResult.error,
        });
      } else {
        let leaveHistoryResult = await leaveService.LeaveHistory(req);
        if (
          leaveHistoryResult &&
          leaveHistoryResult.status_code === HttpStatus.OK
        )
          return res.status(leaveHistoryResult.status_code).json({
            status_code: leaveHistoryResult.status_code,
            success: true,
            data: leaveHistoryResult.data,
          });
        else
          return res.status(leaveHistoryResult.status_code).json({
            status_code: leaveHistoryResult.status_code,
            success: false,
            errors: [leaveHistoryResult.data],
          });
      }
    } catch (error) {
      next(error);
    }
  };

  public leaveHistoryAllEmployee = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let conversionResult: ValidationResult = await Utility.ValidateAndConvert(
        LeaveHistoryAllEmployeeViewmodel,
        JSON.parse(`{"organization_id":"${req.params.organization_id}"}`)
      );

      if (conversionResult.error && conversionResult.error.length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          status_code: HttpStatus.BAD_REQUEST,
          success: false,
          errors: conversionResult.error,
        });
      } else {
        let leaveHistoryResult = await leaveService.LeaveHistoryAllEmployee(
          req
        );
        if (
          leaveHistoryResult &&
          leaveHistoryResult.status_code === HttpStatus.OK
        )
          return res.status(leaveHistoryResult.status_code).json({
            status_code: leaveHistoryResult.status_code,
            success: true,
            data: leaveHistoryResult.data,
          });
        else
          return res.status(leaveHistoryResult.status_code).json({
            status_code: leaveHistoryResult.status_code,
            success: false,
            errors: [leaveHistoryResult.data],
          });
      }
    } catch (error) {
      next(error);
    }
  };

  public uploadLeaveAttachment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let conversionResult: ValidationResult = await Utility.ValidateAndConvert(
        AddLeaveReasonAttachmentViewmodel,
        req.body
      );

      if (conversionResult.error && conversionResult.error.length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          status_code: HttpStatus.BAD_REQUEST,
          success: false,
          errors: conversionResult.error,
        });
      } else {
        let model: AddLeaveReasonAttachmentViewmodel =
          conversionResult.data as AddLeaveReasonAttachmentViewmodel;

        let leaveUpdateResult = await leaveService.UploadLeaveAttachment(
          req,
          model
        );
        if (
          leaveUpdateResult &&
          leaveUpdateResult.status_code === HttpStatus.OK
        )
          return res.status(leaveUpdateResult.status_code).json({
            status_code: leaveUpdateResult.status_code,
            success: true,
            data: leaveUpdateResult.data,
          });
        else
          return res.status(leaveUpdateResult.status_code).json({
            status_code: leaveUpdateResult.status_code,
            success: false,
            errors: [leaveUpdateResult.data],
          });
      }
    } catch (error) {
      next(error);
    }
  };

  public leaveList = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let leaveResult = await leaveService.LeaveList(req);
      if (leaveResult && leaveResult.status_code === HttpStatus.OK)
        return res.status(leaveResult.status_code).json({
          status_code: leaveResult.status_code,
          success: true,
          data: leaveResult.data,
        });
      else
        return res.status(leaveResult.status_code).json({
          status_code: leaveResult.status_code,
          success: false,
          errors: [leaveResult.data],
        });
    } catch (error) {
      next(error);
    }
  };

  public LeaveListByAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let conversionResult: ValidationResult = await Utility.ValidateAndConvert(
        GetLeaveListByAdminViewmodel,
        JSON.parse(`{"employee_id":"${req.params.employee_id}"}`)
      );

      if (conversionResult.error && conversionResult.error.length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          status_code: HttpStatus.BAD_REQUEST,
          success: false,
          errors: conversionResult.error,
        });
      } else {
        let leaveResult = await leaveService.LeaveListByAdmin(req);
        if (leaveResult && leaveResult.status_code === HttpStatus.OK)
          return res.status(leaveResult.status_code).json({
            status_code: leaveResult.status_code,
            success: true,
            data: leaveResult.data,
          });
        else
          return res.status(leaveResult.status_code).json({
            status_code: leaveResult.status_code,
            success: false,
            errors: [leaveResult.data],
          });
      }
    } catch (error) {
      next(error);
    }
  };
  public addLeaveType = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let conversionResult: ValidationResult = await Utility.ValidateAndConvert(
        AddLeaveTypeViewmodel,
        req.body
      );

      if (conversionResult.error && conversionResult.error.length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          status_code: HttpStatus.BAD_REQUEST,
          success: false,
          errors: conversionResult.error,
        });
      } else {
        let model: AddLeaveTypeViewmodel =
          conversionResult.data as AddLeaveTypeViewmodel;
        let leaveTypeResult = await leaveService.AddLeaveType(req, model);
        if (leaveTypeResult && leaveTypeResult.status_code === HttpStatus.OK)
          return res.status(leaveTypeResult.status_code).json({
            status_code: leaveTypeResult.status_code,
            success: true,
            data: leaveTypeResult.data,
          });
        else
          return res.status(leaveTypeResult.status_code).json({
            status_code: leaveTypeResult.status_code,
            success: false,
            errors: [leaveTypeResult.data],
          });
      }
    } catch (error) {
      next(error);
    }
  };
  public deleteLeaveType = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let conversionResult: ValidationResult = await Utility.ValidateAndConvert(
        DeleteLeaveTypeViewmodel,
        JSON.parse(`{"leave_type_id":"${req.params.leave_type_id}"}`)
      );

      if (conversionResult.error && conversionResult.error.length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          status_code: HttpStatus.BAD_REQUEST,
          success: false,
          errors: conversionResult.error,
        });
      } else {
        let leaveTypeResult = await leaveService.DeleteLeaveType(req);
        if (leaveTypeResult && leaveTypeResult.status_code === HttpStatus.OK)
          return res.status(leaveTypeResult.status_code).json({
            status_code: leaveTypeResult.status_code,
            success: true,
            data: leaveTypeResult.data,
          });
        else
          return res.status(leaveTypeResult.status_code).json({
            status_code: leaveTypeResult.status_code,
            success: false,
            errors: [leaveTypeResult.data],
          });
      }
    } catch (error) {
      next(error);
    }
  };

  public getLeaveType = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let conversionResult: ValidationResult = await Utility.ValidateAndConvert(
        GetLeaveTypeDetailsViewmodel,
        JSON.parse(`{"leave_type_id":"${req.params.leave_type_id}"}`)
      );

      if (conversionResult.error && conversionResult.error.length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          status_code: HttpStatus.BAD_REQUEST,
          success: false,
          errors: conversionResult.error,
        });
      } else {
        let leaveTypeResult = await leaveService.getLeaveTypeDetails(req);
        if (leaveTypeResult && leaveTypeResult.status_code === HttpStatus.OK)
          return res.status(leaveTypeResult.status_code).json({
            status_code: leaveTypeResult.status_code,
            success: true,
            data: leaveTypeResult.data,
          });
        else
          return res.status(leaveTypeResult.status_code).json({
            status_code: leaveTypeResult.status_code,
            success: false,
            errors: [leaveTypeResult.data],
          });
      }
    } catch (error) {
      next(error);
    }
  };
  public updateLeaveType = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let conversionResult: ValidationResult = await Utility.ValidateAndConvert(
        UpdateLeaveTypeViewmodel,
        req.body
      );

      if (conversionResult.error && conversionResult.error.length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          status_code: HttpStatus.BAD_REQUEST,
          success: false,
          errors: conversionResult.error,
        });
      } else {
        let model: UpdateLeaveTypeViewmodel =
          conversionResult.data as UpdateLeaveTypeViewmodel;
        let leaveTypeResult = await leaveService.UpdateLeaveType(req, model);
        if (leaveTypeResult && leaveTypeResult.status_code === HttpStatus.OK)
          return res.status(leaveTypeResult.status_code).json({
            status_code: leaveTypeResult.status_code,
            success: true,
            data: leaveTypeResult.data,
          });
        else
          return res.status(leaveTypeResult.status_code).json({
            status_code: leaveTypeResult.status_code,
            success: false,
            errors: [leaveTypeResult.data],
          });
      }
    } catch (error) {
      next(error);
    }
  };

  public allLeaveTypeList = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let leaveTypeListResult = await leaveService.AllLeaveTypeList(req);
      if (
        leaveTypeListResult &&
        leaveTypeListResult.status_code === HttpStatus.OK
      )
        return res.status(leaveTypeListResult.status_code).json({
          status_code: leaveTypeListResult.status_code,
          success: true,
          data: leaveTypeListResult.data,
        });
      else
        return res.status(leaveTypeListResult.status_code).json({
          status_code: leaveTypeListResult.status_code,
          success: false,
          errors: [leaveTypeListResult.data],
        });
    } catch (error) {
      next(error);
    }
  };

  public addLeaveStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let conversionResult: ValidationResult = await Utility.ValidateAndConvert(
        AddLeaveStatusViewmodel,
        req.body
      );

      if (conversionResult.error && conversionResult.error.length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          status_code: HttpStatus.BAD_REQUEST,
          success: false,
          errors: conversionResult.error,
        });
      } else {
        let model: AddLeaveStatusViewmodel =
          conversionResult.data as AddLeaveStatusViewmodel;
        let leaveStatusResult = await leaveService.AddLeaveStatus(req, model);
        if (
          leaveStatusResult &&
          leaveStatusResult.status_code === HttpStatus.OK
        )
          return res.status(leaveStatusResult.status_code).json({
            status_code: leaveStatusResult.status_code,
            success: true,
            data: leaveStatusResult.data,
          });
        else
          return res.status(leaveStatusResult.status_code).json({
            status_code: leaveStatusResult.status_code,
            success: false,
            errors: [leaveStatusResult.data],
          });
      }
    } catch (error) {
      next(error);
    }
  };
  public deleteLeaveStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let conversionResult: ValidationResult = await Utility.ValidateAndConvert(
        DeleteLeaveStatusViewmodel,
        JSON.parse(`{"leave_status_id":"${req.params.leave_status_id}"}`)
      );

      if (conversionResult.error && conversionResult.error.length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          status_code: HttpStatus.BAD_REQUEST,
          success: false,
          errors: conversionResult.error,
        });
      } else {
        let leaveStatusResult = await leaveService.DeleteLeaveStatus(req);
        if (
          leaveStatusResult &&
          leaveStatusResult.status_code === HttpStatus.OK
        )
          return res.status(leaveStatusResult.status_code).json({
            status_code: leaveStatusResult.status_code,
            success: true,
            data: leaveStatusResult.data,
          });
        else
          return res.status(leaveStatusResult.status_code).json({
            status_code: leaveStatusResult.status_code,
            success: false,
            errors: [leaveStatusResult.data],
          });
      }
    } catch (error) {
      next(error);
    }
  };

  public GetLeaveStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let conversionResult: ValidationResult = await Utility.ValidateAndConvert(
        DeleteLeaveStatusViewmodel,
        JSON.parse(`{"leave_status_id":"${req.params.leave_status_id}"}`)
      );

      if (conversionResult.error && conversionResult.error.length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          status_code: HttpStatus.BAD_REQUEST,
          success: false,
          errors: conversionResult.error,
        });
      } else {
        let leaveStatusResult = await leaveService.GetLeaveStatus(req);
        if (
          leaveStatusResult &&
          leaveStatusResult.status_code === HttpStatus.OK
        )
          return res.status(leaveStatusResult.status_code).json({
            status_code: leaveStatusResult.status_code,
            success: true,
            data: leaveStatusResult.data,
          });
        else
          return res.status(leaveStatusResult.status_code).json({
            status_code: leaveStatusResult.status_code,
            success: false,
            errors: [leaveStatusResult.data],
          });
      }
    } catch (error) {
      next(error);
    }
  };
  public updateLeaveStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let conversionResult: ValidationResult = await Utility.ValidateAndConvert(
        UpdateLeaveStatusViewmodel,
        req.body
      );

      if (conversionResult.error && conversionResult.error.length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          status_code: HttpStatus.BAD_REQUEST,
          success: false,
          errors: conversionResult.error,
        });
      } else {
        let model: UpdateLeaveStatusViewmodel =
          conversionResult.data as UpdateLeaveStatusViewmodel;
        let leaveStatusResult = await leaveService.UpdateLeaveStatus(
          req,
          model
        );
        if (
          leaveStatusResult &&
          leaveStatusResult.status_code === HttpStatus.OK
        )
          return res.status(leaveStatusResult.status_code).json({
            status_code: leaveStatusResult.status_code,
            success: true,
            data: leaveStatusResult.data,
          });
        else
          return res.status(leaveStatusResult.status_code).json({
            status_code: leaveStatusResult.status_code,
            success: false,
            errors: [leaveStatusResult.data],
          });
      }
    } catch (error) {
      next(error);
    }
  };

  public allLeaveStatusList = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let leaveStatusListResult = await leaveService.AllLeaveStatusList(req);
      if (
        leaveStatusListResult &&
        leaveStatusListResult.status_code === HttpStatus.OK
      )
        return res.status(leaveStatusListResult.status_code).json({
          status_code: leaveStatusListResult.status_code,
          success: true,
          data: leaveStatusListResult.data,
        });
      else
        return res.status(leaveStatusListResult.status_code).json({
          status_code: leaveStatusListResult.status_code,
          success: false,
          errors: [leaveStatusListResult.data],
        });
    } catch (error) {
      next(error);
    }
  };

  public addLeaveReason = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let conversionResult: ValidationResult = await Utility.ValidateAndConvert(
        AddLeaveReasonViewmodel,
        req.body
      );

      if (conversionResult.error && conversionResult.error.length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          status_code: HttpStatus.BAD_REQUEST,
          success: false,
          errors: conversionResult.error,
        });
      } else {
        let model: AddLeaveReasonViewmodel =
          conversionResult.data as AddLeaveReasonViewmodel;
        let leaveReasonResult = await leaveService.AddLeaveReason(req, model);
        if (
          leaveReasonResult &&
          leaveReasonResult.status_code === HttpStatus.OK
        )
          return res.status(leaveReasonResult.status_code).json({
            status_code: leaveReasonResult.status_code,
            success: true,
            data: leaveReasonResult.data,
          });
        else
          return res.status(leaveReasonResult.status_code).json({
            status_code: leaveReasonResult.status_code,
            success: false,
            errors: [leaveReasonResult.data],
          });
      }
    } catch (error) {
      next(error);
    }
  };
  public deleteLeaveReason = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let conversionResult: ValidationResult = await Utility.ValidateAndConvert(
        DeleteLeaveReasonViewmodel,
        JSON.parse(`{"leave_reason_id":"${req.params.leave_reason_id}"}`)
      );

      if (conversionResult.error && conversionResult.error.length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          status_code: HttpStatus.BAD_REQUEST,
          success: false,
          errors: conversionResult.error,
        });
      } else {
        let leaveReasonResult = await leaveService.DeleteLeaveReason(req);
        if (
          leaveReasonResult &&
          leaveReasonResult.status_code === HttpStatus.OK
        )
          return res.status(leaveReasonResult.status_code).json({
            status_code: leaveReasonResult.status_code,
            success: true,
            data: leaveReasonResult.data,
          });
        else
          return res.status(leaveReasonResult.status_code).json({
            status_code: leaveReasonResult.status_code,
            success: false,
            errors: [leaveReasonResult.data],
          });
      }
    } catch (error) {
      next(error);
    }
  };
  public updateLeaveReason = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let conversionResult: ValidationResult = await Utility.ValidateAndConvert(
        UpdateLeaveReasonViewmodel,
        req.body
      );

      if (conversionResult.error && conversionResult.error.length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          status_code: HttpStatus.BAD_REQUEST,
          success: false,
          errors: conversionResult.error,
        });
      } else {
        let model: UpdateLeaveReasonViewmodel =
          conversionResult.data as UpdateLeaveReasonViewmodel;
        let leaveReasonResult = await leaveService.UpdateLeaveReason(
          req,
          model
        );
        if (
          leaveReasonResult &&
          leaveReasonResult.status_code === HttpStatus.OK
        )
          return res.status(leaveReasonResult.status_code).json({
            status_code: leaveReasonResult.status_code,
            success: true,
            data: leaveReasonResult.data,
          });
        else
          return res.status(leaveReasonResult.status_code).json({
            status_code: leaveReasonResult.status_code,
            success: false,
            errors: [leaveReasonResult.data],
          });
      }
    } catch (error) {
      next(error);
    }
  };

  public allLeaveReasonList = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let leaveReasonListResult = await leaveService.AllLeaveReasonList(req);
      if (
        leaveReasonListResult &&
        leaveReasonListResult.status_code === HttpStatus.OK
      )
        return res.status(leaveReasonListResult.status_code).json({
          status_code: leaveReasonListResult.status_code,
          success: true,
          data: leaveReasonListResult.data,
        });
      else
        return res.status(leaveReasonListResult.status_code).json({
          status_code: leaveReasonListResult.status_code,
          success: false,
          errors: [leaveReasonListResult.data],
        });
    } catch (error) {
      next(error);
    }
  };

  public AddLeaveDeductionCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let conversionResult: ValidationResult = await Utility.ValidateAndConvert(
        AddLeaveDeductionCategoryViewmodel,
        req.body
      );

      if (conversionResult.error && conversionResult.error.length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          status_code: HttpStatus.BAD_REQUEST,
          success: false,
          errors: conversionResult.error,
        });
      } else {
        let model: AddLeaveDeductionCategoryViewmodel =
          conversionResult.data as AddLeaveDeductionCategoryViewmodel;
        let leaveDeductionResult = await leaveService.AddLeaveDeductionCategory(
          req,
          model
        );
        if (
          leaveDeductionResult &&
          leaveDeductionResult.status_code === HttpStatus.OK
        )
          return res.status(leaveDeductionResult.status_code).json({
            status_code: leaveDeductionResult.status_code,
            success: true,
            data: leaveDeductionResult.data,
          });
        else
          return res.status(leaveDeductionResult.status_code).json({
            status_code: leaveDeductionResult.status_code,
            success: false,
            errors: [leaveDeductionResult.data],
          });
      }
    } catch (error) {
      next(error);
    }
  };
  public DeleteLeaveDeductionCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let conversionResult: ValidationResult = await Utility.ValidateAndConvert(
        DeleteLeaveDeductionCategoryViewmodel,
        JSON.parse(`{"_id":"${req.params._id}"}`)
      );

      if (conversionResult.error && conversionResult.error.length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          status_code: HttpStatus.BAD_REQUEST,
          success: false,
          errors: conversionResult.error,
        });
      } else {
        let leaveDeductionResult =
          await leaveService.DeleteLeaveDeductionCategory(req);
        if (
          leaveDeductionResult &&
          leaveDeductionResult.status_code === HttpStatus.OK
        )
          return res.status(leaveDeductionResult.status_code).json({
            status_code: leaveDeductionResult.status_code,
            success: true,
            data: leaveDeductionResult.data,
          });
        else
          return res.status(leaveDeductionResult.status_code).json({
            status_code: leaveDeductionResult.status_code,
            success: false,
            errors: [leaveDeductionResult.data],
          });
      }
    } catch (error) {
      next(error);
    }
  };
  public UpdateLeaveDeductionCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let conversionResult: ValidationResult = await Utility.ValidateAndConvert(
        UpdateLeaveDeductionCategoryViewmodel,
        req.body
      );
      if (conversionResult.error && conversionResult.error.length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          status_code: HttpStatus.BAD_REQUEST,
          success: false,
          errors: conversionResult.error,
        });
      } else {
        let model: UpdateLeaveDeductionCategoryViewmodel =
          conversionResult.data as UpdateLeaveDeductionCategoryViewmodel;
        let leaveDeductionResult =
          await leaveService.UpdateLeaveDeductionCategory(req, model);
        if (
          leaveDeductionResult &&
          leaveDeductionResult.status_code === HttpStatus.OK
        )
          return res.status(leaveDeductionResult.status_code).json({
            status_code: leaveDeductionResult.status_code,
            success: true,
            data: leaveDeductionResult.data,
          });
        else
          return res.status(leaveDeductionResult.status_code).json({
            status_code: leaveDeductionResult.status_code,
            success: false,
            errors: [leaveDeductionResult.data],
          });
      }
    } catch (error) {
      next(error);
    }
  };

  public AllLeaveDeductionCategoryList = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let leaveDeductionCategoryListResult =
        await leaveService.AllLeaveDeductionCategoryList(req);
      if (
        leaveDeductionCategoryListResult &&
        leaveDeductionCategoryListResult.status_code === HttpStatus.OK
      )
        return res.status(leaveDeductionCategoryListResult.status_code).json({
          status_code: leaveDeductionCategoryListResult.status_code,
          success: true,
          data: leaveDeductionCategoryListResult.data,
        });
      else
        return res.status(leaveDeductionCategoryListResult.status_code).json({
          status_code: leaveDeductionCategoryListResult.status_code,
          success: false,
          errors: [leaveDeductionCategoryListResult.data],
        });
    } catch (error) {
      next(error);
    }
  };
  public getLeaveDeductionCategoryDetails = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let conversionResult: ValidationResult = await Utility.ValidateAndConvert(
        GetLeaveDeductionCategoryViewmodel,
        JSON.parse(`{"_id":"${req.params._id}"}`)
      );
      if (conversionResult.error && conversionResult.error.length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          status_code: HttpStatus.BAD_REQUEST,
          success: false,
          errors: conversionResult.error,
        });
      } else {
        let leaveDeductionCategoryResult =
          await leaveService.GetLeaveDeductionCategoryDetails(req);
        if (
          leaveDeductionCategoryResult &&
          leaveDeductionCategoryResult.status_code === HttpStatus.OK
        )
          return res.status(leaveDeductionCategoryResult.status_code).json({
            status_code: leaveDeductionCategoryResult.status_code,
            success: true,
            data: leaveDeductionCategoryResult.data,
          });
        else
          return res.status(leaveDeductionCategoryResult.status_code).json({
            status_code: leaveDeductionCategoryResult.status_code,
            success: false,
            errors: [leaveDeductionCategoryResult.data],
          });
      }
    } catch (error) {
      next(error);
    }
  };
}
export default new Leave_Controller();
