import { DocumentType } from "@typegoose/typegoose";
import { Request } from "express";
import HttpStatus from "http-status-codes";
import _ from "lodash";
import moment from "moment";
import mongoose from "mongoose";
import { IServiceResult } from "../../../common/common-methods";
import {
  default as Employee,
  default as employeesModel,
  Employees
} from "../../../models/employee-management-models/employee.model";
import leaveModel, {
  Leave
} from "../../../models/employee-management-models/leave.model";
import LeaveDeductionModel, {
  LeaveDeductionCategory
} from "../../../models/employee-management-models/leave_deduction_category.model";
import LeaveReasonModel, {
  LeaveReason
} from "../../../models/employee-management-models/leave_reason.model";
import LeaveStatusModel, {
  LeaveStatus
} from "../../../models/employee-management-models/leave_status.model";
import LeaveTypeModel, {
  LeaveTypes
} from "../../../models/employee-management-models/leave_type.model";
import roles from "../../../models/employee-management-models/roles.model";
import sendMessage from "../../../utils/mailer1";
import {
  AddLeaveReasonAttachmentViewmodel,
  AddLeaveViewmodel,
  LeaveApprovalViewmodel,
  UpdateLeaveViewmodel
} from "../../../view-models/employee-management-viewmodels/leave/index";
import {
  AddLeaveDeductionCategoryViewmodel,
  UpdateLeaveDeductionCategoryViewmodel
} from "../../../view-models/employee-management-viewmodels/leave/leave-deduction";
import {
  AddLeaveReasonViewmodel,
  UpdateLeaveReasonViewmodel
} from "../../../view-models/employee-management-viewmodels/leave/leave-reason";
import {
  AddLeaveStatusViewmodel,
  UpdateLeaveStatusViewmodel
} from "../../../view-models/employee-management-viewmodels/leave/leave-status/index";
import {
  AddLeaveTypeViewmodel,
  UpdateLeaveTypeViewmodel
} from "../../../view-models/employee-management-viewmodels/leave/leave-type/index";
import employeeService, { EnumRoles } from "../employee/employee.service";

class LeaveService {
  //request  leave

  AddLeave = async (
    req: Request,
    model: AddLeaveViewmodel
  ): Promise<IServiceResult> => {
    try {
      let UserDetails = <DocumentType<Employees>>req.user;
      // const findEmployee = await employeesModel.findById(model.employee_id);
      const findEmployee = await employeesModel.findById(UserDetails._id);
      if (!findEmployee)
        return {
          data: {
            message: "Employee Not Found",
            error: "On Add Error",
          },
          status_code: HttpStatus.BAD_REQUEST,
        };
      else {
        let found_manager = await employeesModel.find({
          _id: { $in: findEmployee.manager },
        });

        let managerEmailIds = found_manager.map((manager) => {
          return manager.email;
        });

        let superAdminAndMasterAdminRole = await roles.find(
          { name: { $in: [EnumRoles.MASTERADMIN.valueOf(), EnumRoles.SUPERADMIN.valueOf()] } },
          { _id: 1, name: 0 }
        );
        let superAdminAndMasterAdminRoleIds: string[] =
          superAdminAndMasterAdminRole.map((x) => {
            return x._id.toString();
          });

        let foundSuperAdminAndmasterAdminEmailIds = await employeesModel.find(
          { roles: { $in: superAdminAndMasterAdminRoleIds } },
          { _id: 0, email: 1 }
        );
        let finalMasterAndSuperAdminEmail =
          foundSuperAdminAndmasterAdminEmailIds.map((x) => {
            return x.email.toString();
          });

        managerEmailIds = _.uniq([
          ...managerEmailIds,
          ...finalMasterAndSuperAdminEmail,
        ]);
        if (!(found_manager && found_manager.length > 0))
          return {
            data: {
              message: "manager Not Found",
              error: "On Add Error",
            },
            status_code: HttpStatus.BAD_REQUEST,
          };
        else {
          let ModelToSave = <Leave>model;

          let startDate = moment(model.from_date, "dd-mm-yy"); // moment(new Date(model.from_date));
          let endDate = moment(model.to_date, "dd-mm-yy"); // moment(new Date(model.to_date));
          let today = moment().format("YYYY-MM-DD");
          if (startDate.isBefore(today))
            return {
              data: {
                message: "From_date Can't Be A Past Date",
                error: "On Add Error",
              },
              status_code: HttpStatus.BAD_REQUEST,
            };
          if (endDate.isBefore(today))
            return {
              data: {
                message: "To_date Can't Be A Past Date",
                error: "On Add Error",
              },
              status_code: HttpStatus.BAD_REQUEST,
            };

          if (endDate.isBefore(startDate))
            return {
              data: {
                message: "To_date Can't Be Less Than From date",
                error: "On Add Error",
              },
              status_code: HttpStatus.BAD_REQUEST,
            };
          ModelToSave.approval_remarks = "";
          ModelToSave.from_date = new Date(model.from_date);
          ModelToSave.to_date = new Date(model.to_date);
          ModelToSave.employee_id = findEmployee._id;
          let foundDefaultLeaveStatus = await LeaveStatusModel.findOne({
            is_default: true,
          });
          ModelToSave.leave_status = foundDefaultLeaveStatus!._id!.toString();
          let createLeaveRequest = await leaveModel.create(ModelToSave);
          let leave_start = startDate.format("DD-MM-YY").toString();
          let leave_end = endDate.format("DD-MM-YY").toString();
          let requestId = createLeaveRequest._id.toString();
          let foundLeaveType = await LeaveTypeModel.findById(model.leave_type);
          let foundLeavereason = await LeaveReasonModel.findById(model.reason);

          let obj = {
            to: managerEmailIds,

            from: "ankit@boffincoders.com",
            subject: `Leave Application:-${findEmployee.fullname}`,
            content: `Hello Sir, Please Approve My Leave.
            Leave Details:-
            employee_id:${UserDetails._id.toString()},
            from_date: ${leave_start},
            to_date: ${leave_end},
            reason:  ${foundLeavereason!.leave_reason},
            leave_type: ${foundLeaveType!.leave_type},
            Leave_request_id:${requestId}`,
          };

          //notify staff manager about leave request
          sendMessage.sendMail1(obj);

          if (createLeaveRequest)
            return {
              status_code: HttpStatus.OK,

              data: {
                message: "leave request sent",
                leave_details: createLeaveRequest,
              },
            };
          else
            return {
              status_code: HttpStatus.BAD_REQUEST,
              data: {
                message: "leave request not sent",
                Error: "On Add Error",
              },
            };
        }
      }
    } catch (error) {
      console.log(error);

      return {
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        data: {
          message: "Internal Server Error",
          Error: "On Add Error",
        },
      };
    }
  };
  UpdateLeave = async (
    req: Request,
    model: UpdateLeaveViewmodel
  ): Promise<IServiceResult> => {
    try {
      const findLeave = await leaveModel
        .findById(model._id)
        .populate({ path: "employee_id" });
      if (findLeave) {
        let employee = <DocumentType<Employees>>findLeave["employee_id"];
        let UserDetails = <DocumentType<Employees>>req.user;
        if (UserDetails._id.toString() != employee._id.toString())
          return {
            data: {
              message: "You Are Not Authorized To Update This Leave",
              error: "On Update Error",
            },
            status_code: HttpStatus.UNAUTHORIZED,
          };
        else {
          let foundDefaultleaveStatus = await LeaveStatusModel.findOne({
            is_default: true,
          });

          if (findLeave.leave_status != foundDefaultleaveStatus!._id.toString())
            return {
              data: {
                message:
                  "This Leave Can't Be Updated Due To Changes Done By Admin Team",
              },
              status_code: HttpStatus.BAD_REQUEST,
            };
          else {
            let ModelToSave = <Leave>model;
            let today = moment().format("YYYY-MM-DD");
            let startDate = moment(model.from_date, "dd-mm-yy");
            if (model.from_date) {
              if (startDate.isBefore(today))
                return {
                  data: {
                    message: "From_date Can't Be A Past Date",
                    error: "On Update Error",
                  },
                  status_code: HttpStatus.BAD_REQUEST,
                };
              ModelToSave.from_date = new Date(model.from_date);
            }
            if (model.to_date) {
              let endDate = moment(model.to_date, "dd-mm-yy");

              if (endDate.isBefore(today))
                return {
                  data: {
                    message: "To_date Can't Be A Past Date",
                    error: "On Update Error",
                  },
                  status_code: HttpStatus.BAD_REQUEST,
                };

              if (endDate.isBefore(startDate))
                return {
                  data: {
                    message: "To_date Can't Be Less Than From date",
                    error: "On Update Error",
                  },
                  status_code: HttpStatus.BAD_REQUEST,
                };

              ModelToSave.to_date = new Date(model.to_date);
            }

            ModelToSave.employee_id = findLeave.employee_id;
            ModelToSave.approval_remarks = findLeave.approval_remarks;
            ModelToSave.attachment = model.attachment ?? findLeave.attachment;
            ModelToSave.leave_status = foundDefaultleaveStatus!._id.toString();
            ModelToSave.leave_count_as = findLeave.leave_count_as;
            ModelToSave.deduction_category = findLeave.deduction_category;

            let updateLeaveRequest = await leaveModel.updateOne(
              {
                _id: model._id,
              },
              ModelToSave
            );

            if (updateLeaveRequest && updateLeaveRequest.modifiedCount > 0) {
              return {
                status_code: HttpStatus.OK,
                data: true,
              };
            } else
              return {
                status_code: HttpStatus.BAD_REQUEST,
                data: {
                  message: "Unable To Update,No Changes Have Been Made",
                  Error: "On Update Error",
                },
              };
          }
        }
      } else
        return {
          data: {
            message: "Leave Not Found",
            error: "On Update Error",
          },
          status_code: HttpStatus.BAD_REQUEST,
        };
    } catch (error) {
      console.log(error);

      return {
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        data: {
          message: "Internal Server Error",
          Error: "On Update Error",
        },
      };
    }
  };
  DeleteLeave = async (req: Request): Promise<IServiceResult> => {
    try {
      const findLeave = await leaveModel
        .findById(req.params._id)
        .populate({ path: "employee_id" });
      if (findLeave) {
        let employee = <DocumentType<Employees>>findLeave["employee_id"];
        let UserDetails = <DocumentType<Employees>>req.user;
        if (UserDetails._id.toString() != employee._id.toString())
          return {
            data: {
              message: "You Are Not Authorized To Delete This Leave",
              error: "On Delete Error",
            },
            status_code: HttpStatus.UNAUTHORIZED,
          };
        else {
          let foundDefaultleaveStatus = await LeaveStatusModel.findOne({
            is_default: true,
          });

          if (findLeave.leave_status != foundDefaultleaveStatus!._id.toString())
            return {
              data: {
                message:
                  "This Leave Can't Be Deleted Due To Changes Done By Admin Team",
              },
              status_code: HttpStatus.BAD_REQUEST,
            };
          else {
            let deleteLeaveRequest = await leaveModel.deleteOne({
              _id: req.params._id,
            });

            if (deleteLeaveRequest && deleteLeaveRequest.deletedCount > 0) {
              return {
                status_code: HttpStatus.OK,
                data: true,
              };
            } else
              return {
                status_code: HttpStatus.BAD_REQUEST,
                data: {
                  message: "An Error Occurred While Deleting Leave Request",
                  Error: "On Delete Error",
                },
              };
          }
        }
      } else
        return {
          data: {
            message: "Leave Not Found",
            error: "On Delete Error",
          },
          status_code: HttpStatus.BAD_REQUEST,
        };
    } catch (error) {
      console.log(error);

      return {
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        data: {
          message: "Internal Server Error",
          Error: "On Delete Error",
        },
      };
    }
  };
  GetLeaveDetails = async (req: Request): Promise<IServiceResult> => {
    try {
      const findLeave = await leaveModel
        .findById(req.params._id)
        .populate([
          { path: "employee_id" },
          { path: "deduction_category", select: ["name"] },
          { path: "leave_type", select: ["leave_type"] },
        ]);

      if (findLeave) {
        let employee = <DocumentType<Employees>>findLeave["employee_id"];
        let userDetails = <DocumentType<Employees>>req.user;

        let findRequestUserRoles = await roles.find({
          _id: { $in: userDetails?.roles },
        });
        let findRequestUserRolesDetails = findRequestUserRoles.map((role) => {
          return role.name;
        });

        if (
          findRequestUserRolesDetails.some((e) =>
            [EnumRoles.MASTERADMIN.valueOf(), EnumRoles.SUPERADMIN.valueOf().toString()].includes(e)
          ) ||
          userDetails._id.toString() == employee._id.toString()
        ) {
          delete findLeave["employee_id"];

          let getLeaveDetails = findLeave;

          if (getLeaveDetails) {
            let type = <DocumentType<LeaveTypes>>getLeaveDetails.leave_type;
            let leave_types = type.leave_type;
            let category: any = <DocumentType<LeaveDeductionCategory>>(
              getLeaveDetails.deduction_category
            );
            let leave_category = category?.name ? category.name : " ";

            let _employee = employee._id;

            let allLeaveReason = await LeaveReasonModel.find({});

            let allLeaveStatus = await LeaveStatusModel.find({});

            allLeaveReason.forEach((x) => {
              if (x._id.toString() == getLeaveDetails!.reason) {
                getLeaveDetails!.reason = x.leave_reason;
              }
            });

            allLeaveStatus.forEach((x) => {
              if (x._id.toString() == getLeaveDetails!.leave_status)
                getLeaveDetails!.leave_status = x.leave_status;
            });

            getLeaveDetails.employee_id = undefined;
            getLeaveDetails.leave_type = undefined;
            getLeaveDetails.deduction_category = undefined;

            return {
              status_code: HttpStatus.OK,
              data: {
                _employee,
                ...getLeaveDetails.toObject(),
                leave_type: leave_types,
                leave_category,
              },
            };
          } else
            return {
              status_code: HttpStatus.BAD_REQUEST,
              data: {
                message: "An Error Occurred While Getting Leave Details",
                Error: "On Fetch Error",
              },
            };
        } else
          return {
            data: {
              message: "You Are Not Authorized To Get This Leave Details",
              error: "On Fetch Error",
            },
            status_code: HttpStatus.UNAUTHORIZED,
          };
      } else
        return {
          data: {
            message: "Leave Not Found",
            error: "On Fetch Error",
          },
          status_code: HttpStatus.BAD_REQUEST,
        };
    } catch (error) {
      console.log(error);

      return {
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        data: {
          message: "Internal Server Error",
          Error: "On Fetch Error",
        },
      };
    }
  };
  ApproveLeaveOrRejectLeave = async (
    req: Request,
    model: LeaveApprovalViewmodel
  ): Promise<IServiceResult> => {
    try {
      let userDetails = <DocumentType<Employees>>req.user;

      let allroles = await roles.find({});
      let superAdminId: string,
        hrId: string,
        managerId: string,
        masterAdminId: string;
      allroles.forEach((role) => {
        if (role.name == EnumRoles.SUPERADMIN) superAdminId = role._id.toString();
        else if (role.name == EnumRoles.MASTERADMIN)
          masterAdminId = role._id.toString();
        else if (role.name == EnumRoles.HR) hrId = role._id.toString();
        else if (role.name == EnumRoles.MANAGER) managerId = role._id.toString();
      });

      //
      let findRequestUserRoles = await roles.find({
        _id: { $in: userDetails.roles },
      });
      let findRequestUserRolesDetails = findRequestUserRoles.map((role) => {
        return role._id.toString();
      });

      if (
        findRequestUserRolesDetails.some((e) =>
          `${[
            `${masterAdminId!},${superAdminId!},${managerId},${hrId!}`,
          ]}`.includes(e)
        )
      ) {
        let findLeave = await leaveModel.findById(model.leave_id);
        if (!findLeave) {
          return {
            data: {
              message: "Leave Request Not Found",
              error: "On Update Error",
            },
            status_code: HttpStatus.BAD_REQUEST,
          };
        } else {
          const foundEmployee = await Employee.findById(findLeave.employee_id);
          if (!foundEmployee) {
            return {
              data: { message: "Employee Not Found", error: "On Update Error" },
              status_code: HttpStatus.BAD_REQUEST,
            };
          } else {
            //check if employee is hr , then leave can be approved by master admin  or superadmin only
            let isEmployeeHR: boolean = false;

            if (foundEmployee.roles.some((e) => [`${hrId}`].includes(e)))
              isEmployeeHR = true;

            if (isEmployeeHR === true) {
              if (
                !findRequestUserRolesDetails.some((e) =>
                  `${[`${masterAdminId},${superAdminId}`]}`.includes(e)
                )
              )
                return {
                  data: {
                    message:
                      "You Are Not Authorized For Update Leave Of Employee With HR Role",
                    error: "On Update Error",
                  },
                  status_code: HttpStatus.UNAUTHORIZED,
                };
              //check if employee is superadmin , then leave can be approved by master admin only
            }
            let isEmployeeSuperAdmin: boolean = false;

            if (
              foundEmployee.roles.some((e) => [`${superAdminId}`].includes(e))
            )
              isEmployeeSuperAdmin = true;

            if (isEmployeeSuperAdmin === true) {
              if (
                !findRequestUserRolesDetails.some((e) =>
                  [`${masterAdminId}`].includes(e)
                )
              )
                return {
                  data: {
                    message:
                      "You Are Not Authorized For Update Leave Of Employee With SuperAdmin Role",
                    error: "On Update Error",
                  },
                  status_code: HttpStatus.UNAUTHORIZED,
                };
            }

            // check if manager approved the leave then employee must be under their mentorship
            if (
              findRequestUserRolesDetails.some((e) =>
                `${[`${managerId!}`]}`.includes(e)
              ) &&
              !foundEmployee.manager.includes(userDetails._id.toString())
            )
              return {
                data: {
                  message: "You Are Not Authorized For Update Leave Status",
                  error: "On Update Error",
                },
                status_code: HttpStatus.UNAUTHORIZED,
              };
            // check if hr approved the leave hr must be of same organization of employee whom leave is to be updated
            else if (
              findRequestUserRolesDetails.some((e) =>
                `${[`${hrId!}`]}`.includes(e)
              ) &&
              userDetails!.organization_id!.toString() !=
                foundEmployee!.organization_id!.toString()
            )
              return {
                data: {
                  message: "You Are Not Authorized For Update Status Of This Leave",
                  error: "On Update Error",
                },
                status_code: HttpStatus.UNAUTHORIZED,
              };
            else {
              let foundSuperAdminAndmasterAdminEmailIds =
                await employeesModel.find(
                  { roles: { $in: [masterAdminId!, superAdminId!] } },
                  { _id: 0, email: 1 }
                );
              let finalMasterAndSuperAdminEmail =
                foundSuperAdminAndmasterAdminEmailIds.map((x) => {
                  return x.email.toString();
                });

              let foundAllManagersEmails = await employeesModel.find(
                { _id: { $in: foundEmployee.manager } },
                { email: 1 }
              );
              let managerEmails = foundAllManagersEmails.map((x) => {
                return x.email;
              });

              let totalReceipentsOfApprovalMail = _.uniq([
                ...managerEmails,
                foundEmployee.email,
                ...finalMasterAndSuperAdminEmail,
              ]);

              let startDate = moment(findLeave.from_date, "dd-mm-yy");
              let endDate = moment(findLeave.to_date, "dd-mm-yy");
              let leave_start = startDate.format("DD-MM-YY").toString();
              let leave_end = endDate.format("DD-MM-YY").toString();

              let foundDeductionCategoryValue =
                await LeaveDeductionModel.findById(model.deduction_category);

              let foundStatusValue = await LeaveStatusModel.findById(
                model.approval_status
              );

              let obj = {
                to: totalReceipentsOfApprovalMail,
                from: "ankit@boffincoders.com",
                subject: `Leave Approval Status-${
                  foundStatusValue!.leave_status
                }`,
                content: `Hello ${
                  foundEmployee.fullname
                },Your Leave Request ${leave_start} to ${leave_end} Has Been ${
                  foundStatusValue!.leave_status
                }.Remarks:${
                  req.body.approval_remarks ?? findLeave.approval_remarks
                }.Money_Deduction_Category:${
                  foundDeductionCategoryValue!.name
                }. ${foundStatusValue!.leave_status} By:${
                  userDetails.fullname
                }`,

                //notify staff manager about leave request
              };
              sendMessage.sendMail1(obj);

              let updateLeaveStatus = await leaveModel.updateOne(
                { _id: new mongoose.Types.ObjectId(model.leave_id) },
                {
                  leave_status: foundStatusValue!._id.toString(),
                  approval_remarks:
                    model.approval_remarks ?? findLeave.approval_remarks,
                  leave_count_as: foundStatusValue!.leave_count_as,
                  deduction_category: foundDeductionCategoryValue!._id,
                  leave_status_update_by: userDetails.email,
                }
              );
              if (
                updateLeaveStatus &&
                updateLeaveStatus.modifiedCount &&
                updateLeaveStatus.modifiedCount > 0
              )
                return {
                  status_code: HttpStatus.OK,

                  data: {
                    message: "Leave Request Status Updated Successfully",
                  },
                };
              else
                return {
                  data: {
                    message: "Unable To Update,No Changes Have Been Made",
                    error: "On Update Error",
                  },
                  status_code: HttpStatus.BAD_REQUEST,
                };
            }
          }
        }
      } else
        return {
          data: {
            message: "You Are Not Authorized For Update Leave Status",
            error: "On Update Error",
          },
          status_code: HttpStatus.UNAUTHORIZED,
        };
    } catch (error) {
      return {
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        data: { message: "Internal Server Error", error: "On Update Error" },
      };
    }
  };
  LeaveHistory = async (req: Request): Promise<IServiceResult> => {
    try {
      let userDetails = <DocumentType<Employees>>req.user;
      let findRequestUserRoles = await roles.find({
        _id: { $in: userDetails.roles },
      });
      let findRequestUserRolesDetails = findRequestUserRoles.map((role) => {
        return role.name;
      });

      let foundEmployee = await employeesModel.findById(req.params.employee_id);
      if (!foundEmployee)
        return {
          data: { message: "Employee Not Found", error: "On Fetch Error" },
          status_code: HttpStatus.BAD_REQUEST,
        };
      let findEmployeeManagersDetails = await employeesModel.find({
        _id: { $in: foundEmployee.manager },
      });
      let findEmployeeManagersEmails = findEmployeeManagersDetails.map(
        (manager) => {
          return manager.email;
        }
      );
      if (
        findRequestUserRolesDetails.some((e) =>
          [EnumRoles.MASTERADMIN.valueOf(), EnumRoles.SUPERADMIN.valueOf()].includes(e)
        ) ||
        userDetails._id.toString() == req.params.employee_id ||
        findEmployeeManagersEmails.includes(userDetails.email)
      ) {
        let foundLeaveHistory = await leaveModel
          .find({
            employee_id: new mongoose.Types.ObjectId(req.params.employee_id),
            leave_count_as: true,
          })
          .populate("leave_type")
          .sort({ from_date: -1 });

        if (foundLeaveHistory && foundLeaveHistory.length > 0) {
          let leaveHistoryResultSinceJoined: any[] = [];
          let leaveHistoryResultThisMonth: any[] = [];
          let leaveHistoryResultThisYear: any[] = [];
          //Total Leave Days Since Joined
          let leaveTypeList = await LeaveTypeModel.find(
            {},
            { _id: 1, leave_type: 1 }
          );
          let single_leave = 1;
          leaveTypeList.forEach((type) => {
            var countvalue = 0;
            foundLeaveHistory.forEach((leave) => {
              let temp_leave = <DocumentType<LeaveTypes>>leave["leave_type"];
              let diffTime = Math.abs(
                new Date(leave.to_date).valueOf() -
                  new Date(leave.from_date).valueOf() +
                  1
              );
              let leave_days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

              if (leave_days == 0) leave_days = single_leave;
              if (temp_leave.leave_type == type.leave_type)
                countvalue += leave_days;
            });
            if (countvalue > 0) {
              let obj = { name: type.leave_type, count: countvalue };
              leaveHistoryResultSinceJoined.push(obj);
            }
          });

          //Current Year Leave Count

          let currentYear = new Date().getFullYear();

          leaveTypeList.forEach((type) => {
            var countvalue = 0;
            foundLeaveHistory.forEach((leave) => {
              if (
                new Date(leave.from_date).getFullYear() == currentYear &&
                new Date(leave.to_date).getFullYear() == currentYear
              ) {
                let temp_leave = <DocumentType<LeaveTypes>>leave["leave_type"];
                let diffTime = Math.abs(
                  new Date(leave.to_date).valueOf() -
                    new Date(leave.from_date).valueOf() +
                    1
                );
                let leave_days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (leave_days == 0) leave_days = single_leave;
                if (temp_leave.leave_type == type.leave_type)
                  countvalue += leave_days;
              }
            });
            if (countvalue > 0) {
              let obj = { name: type.leave_type, count: countvalue };
              leaveHistoryResultThisYear.push(obj);
            }
          });

          //Current Month Leave Count

          let runningYear = new Date().getFullYear();
          let currentMonth = new Date().getMonth() + 1;

          leaveTypeList.forEach((type) => {
            let countvalue = 0;

            let tempLeaveHistory = foundLeaveHistory;
            tempLeaveHistory.forEach((leave) => {
              if (
                new Date(leave.from_date).getMonth() + 1 === currentMonth &&
                new Date(leave.to_date).getMonth() + 1 === currentMonth &&
                new Date(leave.from_date).getFullYear() == runningYear &&
                new Date(leave.to_date).getFullYear() == runningYear
              ) {
                let temp_leave = <DocumentType<LeaveTypes>>leave["leave_type"];
                let diffTime = Math.abs(
                  new Date(leave.to_date).valueOf() -
                    new Date(leave.from_date).valueOf() +
                    1
                );
                let leave_days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (leave_days == 0) leave_days = single_leave;
                if (temp_leave.leave_type == type.leave_type)
                  countvalue += leave_days;
              }
            });
            if (countvalue > 0) {
              let obj = { name: type.leave_type, count: countvalue };
              leaveHistoryResultThisMonth.push(obj);
            }
          });

          //Last taken Leave
          let leave_doc = foundLeaveHistory[0];
          let leave_type_value = <DocumentType<LeaveTypes>>(
            leave_doc!["leave_type"]
          );

          let foundLeaveType = leaveTypeList.filter((type_elem) => {
            if (type_elem._id == leave_type_value!._id)
              return type_elem.leave_type;
          });
          let startDate = new Date(leave_doc.from_date);
          let endDate = new Date(leave_doc.to_date);
          let leave_start =
            startDate.getDate() +
            "-" +
            (startDate.getMonth() + 1) +
            "-" +
            startDate.getFullYear();
          let leave_end =
            endDate.getDate() +
            "-" +
            (endDate.getMonth() + 1) +
            "-" +
            endDate.getFullYear();

          let leaveHistoryResponse = {
            "Since Joining Total Leave": leaveHistoryResultSinceJoined,
            "This Year Total Leave": leaveHistoryResultThisYear,
            "This Month Total leave": leaveHistoryResultThisMonth,
            "Last taken Leave": `last taken leave from ${leave_start} to ${leave_end} ${
              foundLeaveType && foundLeaveType.length > 0
                ? foundLeaveType[0]!.leave_type
                : ""
            }`,
          };

          return {
            data: leaveHistoryResponse,
            status_code: HttpStatus.OK,
          };
        } else
          return {
            data: {
              message: "Leave History Not Found",
              error: "On Fetch Error",
            },
            status_code: HttpStatus.BAD_REQUEST,
          };
      } else
        return {
          data: {
            message:
              "You Are Not Authorized For Fetching Leave History Of This Employee",
            error: "on Fetch Error",
          },
          status_code: HttpStatus.UNAUTHORIZED,
        };
    } catch (error) {
      console.log(error);

      return {
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        data: { message: "Internal Server Error", error: "On Fetch Error" },
      };
    }
  };
  UploadLeaveAttachment = async (
    req: Request,
    model: AddLeaveReasonAttachmentViewmodel
  ): Promise<IServiceResult> => {
    try {
      let userDetails = <DocumentType<Employees>>req.user;
      const findEmployee = await employeesModel.findById(userDetails._id);
      if (!findEmployee)
        return {
          data: {
            message: "Employee Not Found",
            error: "On Update Error",
          },
          status_code: HttpStatus.BAD_REQUEST,
        };
      else {
        let foundLeave = await leaveModel
          .findById(model.leave_id)
          .populate("leave_type");
        if (!foundLeave)
          return {
            data: {
              message: "Leave Not Found",
              error: "On Update Error",
            },
            status_code: HttpStatus.BAD_REQUEST,
          };

        if (foundLeave && foundLeave.employee_id!.toString() != userDetails._id)
          return {
            data: {
              message:
                "You Are Not Authorized For Upload Documents For This Leave",
              error: "On Update Error",
            },
            status_code: HttpStatus.UNAUTHORIZED,
          };

        let found_manager = await employeesModel.find({
          _id: { $in: findEmployee.manager },
        });

        let managerEmailIds = found_manager.map((manager) => {
          return manager.email;
        });

        let superAdminAndMasterAdminRole = await roles.find(
          { name: { $in: [EnumRoles.MASTERADMIN, EnumRoles.SUPERADMIN] } },
          { _id: 1, name: 0 }
        );
        let superAdminAndMasterAdminRoleIds: string[] =
          superAdminAndMasterAdminRole.map((x) => {
            return x._id.toString();
          });

        let foundSuperAdminAndmasterAdminEmailIds = await employeesModel.find(
          { roles: { $in: superAdminAndMasterAdminRoleIds } },
          { _id: 0, email: 1 }
        );
        let finalMasterAndSuperAdminEmail =
          foundSuperAdminAndmasterAdminEmailIds.map((x) => {
            return x.email.toString();
          });

        managerEmailIds = _.uniq([
          ...managerEmailIds,
          ...finalMasterAndSuperAdminEmail,
        ]);

        //foundLeave.attachment = _.uniq(model.attachment);
        let uniqueAtachmentsListToBeUpdated = _.uniq(model.attachment);
        let updateLeave = await leaveModel.updateOne(
          { _id: model.leave_id },
          { attachment: uniqueAtachmentsListToBeUpdated }
        );
        if (updateLeave && updateLeave.modifiedCount > 0) {
          let startDate = moment(foundLeave.from_date, "dd-mm-yy");
          let endDate = moment(foundLeave.to_date, "dd-mm-yy");
          let leave_start = startDate.format("DD-MM-YY").toString();
          let leave_end = endDate.format("DD-MM-YY").toString();
          let foundLeaveType = <DocumentType<LeaveTypes>>(
            foundLeave["leave_type"]
          );
          let foundLeavereason = await LeaveReasonModel.findById(
            foundLeave.reason
          );
          let attachmentArray: string[] = [];
          uniqueAtachmentsListToBeUpdated.forEach((file, i) => {
            let obj = {
              [i + 1]: file,
            };

            attachmentArray.push(JSON.parse(JSON.stringify(obj)));
          });
          let obj = {
            to: managerEmailIds,
            from: "ankit@boffincoders.com",
            subject: `Leave Application:-${findEmployee.fullname}`,
            content: `Hello Sir,Required Document Uploaded,Please Have A Look.
            Leave Details:-
            employee_id:${foundLeave.employee_id},
            from_date: ${leave_start},
            to_date: ${leave_end},
            reason:  ${foundLeavereason!.leave_reason},
            leave_type: ${foundLeaveType.leave_type},
            Leave_request_id:${
              model.leave_id
            } and Documents:${uniqueAtachmentsListToBeUpdated}`,
          };

          //notify staff manager about leave request
          sendMessage.sendMail1(obj);
          return { data: true, status_code: HttpStatus.OK };
        } else
          return {
            status_code: HttpStatus.BAD_REQUEST,
            data: {
              message: "Unable To Upload,No Changes Have Been Made",
              Error: "On Update Error",
            },
          };
      }
    } catch (error) {
      console.log(error);

      return {
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        data: {
          message: "Internal Server Error",
          Error: "On Update Error",
        },
      };
    }
  };
  LeaveList = async (req: Request): Promise<IServiceResult> => {
    try {
      let userDetails = <DocumentType<Employees>>req.user;

      let foundLeaveList = await leaveModel
        .find(
          {
            employee_id: userDetails._id,
          },
          { attachment: 0 }
        )
        .populate(["leave_type", "deduction_category"])
        .sort({ from_date: -1 });

      let tempResult: any = [];
      let finalResult: any = [];

      if (foundLeaveList && foundLeaveList.length > 0) {
        foundLeaveList.forEach((temp_leave) => {
          let type = <DocumentType<LeaveTypes>>temp_leave.leave_type;
          let leave_types = type.leave_type;
          let category: any = <DocumentType<LeaveDeductionCategory>>(
            temp_leave.deduction_category
          );
          let leave_category = category?.name ? category?.name : "";

          tempResult.push({
            ...temp_leave.toObject(),
            leave_types,
            leave_category,
          });
        });

        let allLeaveReason = await LeaveReasonModel.find({});

        let allLeaveStatus = await LeaveStatusModel.find({});

        tempResult.forEach((leave_obj: any) => {
          allLeaveReason.forEach((x) => {
            if (x._id.toString() == leave_obj.reason)
              leave_obj.reason = x.leave_reason;
          });

          allLeaveStatus.forEach((x) => {
            if (x._id.toString() == leave_obj.leave_status)
              leave_obj.leave_status = x.leave_status;
          });

          finalResult.push(leave_obj);
        });
      }
      let finalLeaveList: any = [];
      finalResult.forEach((leave: any) => {
        delete leave["leave_type"];
        delete leave["deduction_category"];

        finalLeaveList.push(leave);
      });
      return {
        data: finalLeaveList,
        status_code: HttpStatus.OK,
      };
    } catch (error) {
      console.log(error);

      return {
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        data: { message: "Internal Server Error", error: "On Fetch Error" },
      };
    }
  };
  LeaveListByAdmin = async (req: Request): Promise<IServiceResult> => {
    try {
      let userDetails = <DocumentType<Employees>>req.user;
      let findRequestUserRoles = await roles.find({
        _id: { $in: userDetails.roles },
      });
      let findRequestUserRolesDetails = findRequestUserRoles.map((role) => {
        return role.name;
      });

      if (
        !findRequestUserRolesDetails.some((e) =>
          [EnumRoles.MASTERADMIN.valueOf(), EnumRoles.SUPERADMIN.valueOf(), EnumRoles.HR.valueOf()].includes(e)
        )
      )
        return {
          data: {
            message: "You Are Not Authorized For Getting Leave List",
            error: "On Add Error",
          },
          status_code: HttpStatus.UNAUTHORIZED,
        };
      else {
        let foundLeaveList = await leaveModel
          .find(
            {
              employee_id: req.params.employee_id,
            },
            { attachment: 0 }
          )
          .populate(["leave_type", "deduction_category"])
          .sort({ createdAt: -1 });

        let tempResult: any = [];
        let finalResult: any = [];

        if (foundLeaveList && foundLeaveList.length > 0) {
          foundLeaveList.forEach((temp_leave) => {
            let type = <DocumentType<LeaveTypes>>temp_leave.leave_type;
            let leave_types = type.leave_type;
            let category: any = <DocumentType<LeaveDeductionCategory>>(
              temp_leave.deduction_category
            );
            let leave_category = category?.name ? category.name : "";

            tempResult.push({
              ...temp_leave.toObject(),
              leave_type: leave_types,
              leave_category,
            });
          });

          let allLeaveReason = await LeaveReasonModel.find({});

          let allLeaveStatus = await LeaveStatusModel.find({});

          tempResult.forEach((leave_obj: any) => {
            allLeaveReason.forEach((x) => {
              if (x._id.toString() == leave_obj.reason)
                leave_obj.reason = x.leave_reason;
            });

            allLeaveStatus.forEach((x) => {
              if (x._id.toString() == leave_obj.leave_status)
                leave_obj.leave_status = x.leave_status;
            });

            finalResult.push(leave_obj);
          });
        }
        let finalLeaveList: any = [];
        finalResult.forEach((leave: any) => {
          delete leave["deduction_category"];
          finalLeaveList.push(leave);
        });

        return {
          data: finalLeaveList,
          status_code: HttpStatus.OK,
        };
      }
    } catch (error) {
      console.log(error);

      return {
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        data: { message: "Internal Server Error", error: "On Fetch Error" },
      };
    }
  };
  LeaveHistoryAllEmployee = async (req: Request): Promise<IServiceResult> => {
    try {
      let userDetails = <DocumentType<Employees>>req.user;
      let findRequestUserRoles = await roles.find({
        _id: { $in: userDetails.roles },
      });
      let findRequestUserRolesDetails = findRequestUserRoles.map((role) => {
        return role.name;
      });
      if (
        findRequestUserRolesDetails.some((e) =>
          [EnumRoles.SUPERADMIN.valueOf(), EnumRoles.MASTERADMIN.valueOf()].includes(e)
        )
      ) {
        let foundLeaveHistory: Leave[] = [];
        let allEmployeeList = await employeeService.allEmployeeList(req);
        if (req.params.organization_id) {
          foundLeaveHistory = await leaveModel
            .find({
              leave_count_as: true,
              organization_id: new mongoose.Types.ObjectId(
                req.params.organization_id
              ),
            })
            .populate("leave_type")
            .sort({ from_date: -1 });
        } else {
          foundLeaveHistory = await leaveModel
            .find({
              leave_count_as: true,
            })
            .populate("leave_type")
            .sort({ from_date: -1 });
        }
        let leaveTypeList = await LeaveTypeModel.find(
          {},
          { _id: 1, leave_type: 1 }
        );
        if (
          foundLeaveHistory
          // && foundLeaveHistory.length > 0
        ) {
          // if (allEmployeeList && allEmployeeList.data.length > 0) {
          let response: any[] = [];
          foundLeaveHistory.forEach((emp_leave) => {
            let leaveHistoryResultSinceJoined: any[] = [];
            let leaveHistoryResultThisMonth: any[] = [];
            let leaveHistoryResultThisYear: any[] = [];
            //Total Leave Days Since Joined
            let single_leave = 1;
            leaveTypeList.forEach((type) => {
              var countvalue = 0;
              foundLeaveHistory.forEach((leave) => {
                if (
                  emp_leave.employee_id!.toString() ==
                  leave.employee_id!.toString()
                ) {
                  let temp_leave = <DocumentType<LeaveTypes>>(
                    leave["leave_type"]
                  );
                  let diffTime = Math.abs(
                    new Date(leave.to_date).valueOf() -
                      new Date(leave.from_date).valueOf() +
                      1
                  );
                  let leave_days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                  if (leave_days == 0) leave_days = single_leave;
                  if (temp_leave.leave_type == type.leave_type)
                    countvalue += leave_days;
                }
              });
              if (countvalue > 0) {
                let obj = { name: type.leave_type, count: countvalue };
                leaveHistoryResultSinceJoined.push(obj);
              }
            });
            //Current Year Leave Count
            let currentYear = new Date().getFullYear();
            leaveTypeList.forEach((type) => {
              var countvalue = 0;
              foundLeaveHistory.forEach((leave) => {
                if (
                  emp_leave.employee_id!.toString() ==
                  leave.employee_id!.toString()
                ) {
                  if (
                    new Date(leave.from_date).getFullYear() == currentYear &&
                    new Date(leave.to_date).getFullYear() == currentYear
                  ) {
                    let temp_leave = <DocumentType<LeaveTypes>>(
                      leave["leave_type"]
                    );
                    let diffTime = Math.abs(
                      new Date(leave.to_date).valueOf() -
                        new Date(leave.from_date).valueOf() +
                        1
                    );
                    let leave_days = Math.ceil(
                      diffTime / (1000 * 60 * 60 * 24)
                    );
                    if (leave_days == 0) leave_days = single_leave;
                    if (temp_leave.leave_type == type.leave_type)
                      countvalue += leave_days;
                  }
                }
              });
              if (countvalue > 0) {
                let obj = { name: type.leave_type, count: countvalue };
                leaveHistoryResultThisYear.push(obj);
              }
            });
            //Current Month Leave Count
            let runningYear = new Date().getFullYear();
            let currentMonth = new Date().getMonth() + 1;
            leaveTypeList.forEach((type) => {
              let countvalue = 0;
              let tempLeaveHistory = foundLeaveHistory;
              tempLeaveHistory.forEach((leave) => {
                if (
                  emp_leave.employee_id!.toString() ==
                  leave.employee_id!.toString()
                ) {
                  if (
                    new Date(leave.from_date).getMonth() + 1 === currentMonth &&
                    new Date(leave.to_date).getMonth() + 1 === currentMonth &&
                    new Date(leave.from_date).getFullYear() == runningYear &&
                    new Date(leave.to_date).getFullYear() == runningYear
                  ) {
                    let temp_leave = <DocumentType<LeaveTypes>>(
                      leave["leave_type"]
                    );
                    let diffTime = Math.abs(
                      new Date(leave.to_date).valueOf() -
                        new Date(leave.from_date).valueOf() +
                        1
                    );
                    let leave_days = Math.ceil(
                      diffTime / (1000 * 60 * 60 * 24)
                    );

                    if (leave_days == 0) leave_days = single_leave;
                    if (temp_leave.leave_type == type.leave_type)
                      countvalue += leave_days;
                  }
                }
              });
              if (countvalue > 0) {
                let obj = { name: type.leave_type, count: countvalue };
                leaveHistoryResultThisMonth.push(obj);
              }
            });

            //Last taken Leave
            let docForLastLeave = foundLeaveHistory.filter((x) => {
              if (
                x.employee_id?.toString() == emp_leave.employee_id?.toString()
              )
                return x;
            });
            let leave_doc = docForLastLeave[0];
            let leave_type_value = <DocumentType<LeaveTypes>>(
              leave_doc!["leave_type"]
            );

            let foundLeaveType = leaveTypeList.filter((type_elem) => {
              if (type_elem._id == leave_type_value!._id)
                return type_elem.leave_type;
            });

            let startDate = new Date(leave_doc.from_date);
            let endDate = new Date(leave_doc.to_date);
            let leave_start =
              startDate.getDate() +
              "-" +
              (startDate.getMonth() + 1) +
              "-" +
              startDate.getFullYear();
            let leave_end =
              endDate.getDate() +
              "-" +
              (endDate.getMonth() + 1) +
              "-" +
              endDate.getFullYear();

            let leaveHistoryResponse = {
              "Since Joining Total Leave": leaveHistoryResultSinceJoined,
              "This Year Total Leave": leaveHistoryResultThisYear,
              "This Month Total leave": leaveHistoryResultThisMonth,
              "Last taken Leave": `last taken leave from ${leave_start} to ${leave_end} ${
                foundLeaveType && foundLeaveType.length > 0
                  ? foundLeaveType[0]!.leave_type
                  : ""
              }`,
            };
            let finalObj = {
              employee: emp_leave.employee_id!.toString(),
              leaveHistory: leaveHistoryResponse,
            };
            response.push(finalObj);
          });
          let finalResponse = _.uniqBy(response, "employee");
          let result: any[] = [];

          allEmployeeList.data.forEach((x: any) => {
            finalResponse.forEach((ress) => {
              if (ress.employee == x._id.toString()) result.push(ress);
            });
          });

          let allEmp: any[] = [];
          allEmployeeList.data.forEach((x: any) => {
            let obj = {
              employee: x._id.toString(),
              leaveHistory: {
                message: "No Leave History Available for This Employee",
              },
            };
            allEmp.push(obj);
          });

          allEmp.forEach((x) => {
            result.forEach((ress) => {
              if (ress.employee != x.employee) result.push(x);
            });
          });

          return {
            //result,
            data: _.uniqBy(result, "employee"),
            //data:finalResponse,
            status_code: HttpStatus.OK,
          };
        } else
          return {
            data: {
              message: "Leave History Not Found",
              error: "On Fetch Error",
            },
            status_code: HttpStatus.BAD_REQUEST,
          };
      } else
        return {
          data: {
            message:
              "You Are Not Authorized For Fetching Leave History Of All Employee",
            error: "on Fetch Error",
          },
          status_code: HttpStatus.UNAUTHORIZED,
        };
    } catch (error) {
      console.log(error);

      return {
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        data: { message: "Internal Server Error", error: "On Fetch Error" },
      };
    }
  };

  //Leave Type  Section

  AddLeaveType = async (
    req: Request,
    model: AddLeaveTypeViewmodel
  ): Promise<IServiceResult> => {
    try {
      let userDetails = <DocumentType<Employees>>req.user;
      let findRequestUserRoles = await roles.find({
        _id: { $in: userDetails.roles },
      });
      let findRequestUserRolesDetails = findRequestUserRoles.map((role) => {
        return role.name;
      });

      if (!findRequestUserRolesDetails.includes("masteradmin"))
        return {
          data: {
            message: "You Are Not Authorized For Add Leave Type",
            error: "On Add Error",
          },
          status_code: HttpStatus.UNAUTHORIZED,
        };
      else {
        let checkLeaveTypeExistence = await LeaveTypeModel.findOne({
          leave_type: model.leave_type,
        });
        if (!checkLeaveTypeExistence) {
          let ModelToSave = <DocumentType<LeaveTypes>>model;
          let addLeaveType = await LeaveTypeModel.create(ModelToSave);

          if (addLeaveType)
            return {
              status_code: HttpStatus.OK,

              data: addLeaveType,
            };
          else
            return {
              status_code: HttpStatus.BAD_REQUEST,
              data: {
                message: " An Error Occurred While Adding Leave Type",
                Error: "On Add Error",
              },
            };
        } else
          return {
            status_code: HttpStatus.BAD_REQUEST,
            data: {
              message: "This Leave Type Already Existed ",
              Error: "On Add Error",
            },
          };
      }
    } catch (error) {
      console.log(error);

      return {
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        data: {
          message: "Internal Server Error",
          Error: "On Add Error",
        },
      };
    }
  };
  DeleteLeaveType = async (req: Request): Promise<IServiceResult> => {
    try {
      let userDetails = <DocumentType<Employees>>req.user;
      let findRequestUserRoles = await roles.find({
        _id: { $in: userDetails.roles },
      });
      let findRequestUserRolesDetails = findRequestUserRoles.map((role) => {
        return role.name;
      });

      if (!findRequestUserRolesDetails.includes("masteradmin"))
        return {
          data: {
            message: "You Are Not Authorized For Delete Leave Type",
            error: "On Delete Error",
          },
          status_code: HttpStatus.UNAUTHORIZED,
        };
      else {
        let deleteLeaveType = await LeaveTypeModel.deleteOne({
          _id: new mongoose.Types.ObjectId(req.params.leave_type_id),
        });

        if (deleteLeaveType && deleteLeaveType.deletedCount > 0)
          return {
            status_code: HttpStatus.OK,

            data: true,
          };
        else
          return {
            status_code: HttpStatus.BAD_REQUEST,
            data: {
              message: " An Error Occurred While Deleting Leave Type",
              Error: "On Delete Error",
            },
          };
      }
    } catch (error) {
      console.log(error);

      return {
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        data: {
          message: "Internal Server Error",
          Error: "On Delete Error",
        },
      };
    }
  };

  getLeaveTypeDetails = async (req: Request): Promise<IServiceResult> => {
    try {
      let userDetails = <DocumentType<Employees>>req.user;
      let findRequestUserRoles = await roles.find({
        _id: { $in: userDetails.roles },
      });
      let findRequestUserRolesDetails = findRequestUserRoles.map((role) => {
        return role.name;
      });

      if (!findRequestUserRolesDetails.includes("masteradmin"))
        return {
          data: {
            message: "You Are Not Authorized For getting Leave Type Details",
            error: "On Fetch Error",
          },
          status_code: HttpStatus.UNAUTHORIZED,
        };
      else {
        let getLeaveTypeDetails = await LeaveTypeModel.findById(
          req.params.leave_type_id
        );

        if (getLeaveTypeDetails)
          return {
            status_code: HttpStatus.OK,

            data: getLeaveTypeDetails,
          };
        else
          return {
            status_code: HttpStatus.BAD_REQUEST,
            data: {
              message: " An Error Occurred While Getting Leave Type Details",
              Error: "On Fetch Error",
            },
          };
      }
    } catch (error) {
      console.log(error);
      return {
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        data: {
          message: "Internal Server Error",
          Error: "On Fetch Error",
        },
      };
    }
  };
  UpdateLeaveType = async (
    req: Request,
    model: UpdateLeaveTypeViewmodel
  ): Promise<IServiceResult> => {
    try {
      let userDetails = <DocumentType<Employees>>req.user;
      let findRequestUserRoles = await roles.find({
        _id: { $in: userDetails.roles },
      });
      let findRequestUserRolesDetails = findRequestUserRoles.map((role) => {
        return role.name;
      });

      if (!findRequestUserRolesDetails.includes("masteradmin"))
        return {
          data: {
            message: "You Are Not Authorized For Update Leave Type",
            error: "On Update Error",
          },
          status_code: HttpStatus.UNAUTHORIZED,
        };
      else {
        let foundLeaveType = await LeaveTypeModel.findById(model.leave_type_id);
        if (foundLeaveType) {
          let checkLeaveTypeExistence = await LeaveTypeModel.findOne({
            leave_type: model.leave_type,
          });
          if (!checkLeaveTypeExistence) {
            let updateLeaveType = await LeaveTypeModel.updateOne(
              { _id: new mongoose.Types.ObjectId(model.leave_type_id) },
              {
                leave_type: model.leave_type ?? foundLeaveType.leave_type,
                deduction_value:
                  model.deduction_value ?? foundLeaveType.deduction_value,
              }
            );

            if (updateLeaveType && updateLeaveType.modifiedCount > 0)
              return {
                status_code: HttpStatus.OK,
                data: true,
              };
            else
              return {
                status_code: HttpStatus.BAD_REQUEST,
                data: {
                  message: "Unable To Update,No Changes Have Been Made",
                  Error: "On Update Error",
                },
              };
          } else {
            if (checkLeaveTypeExistence._id.toString() == model.leave_type_id) {
              let updateLeaveType = await LeaveTypeModel.updateOne(
                { _id: new mongoose.Types.ObjectId(model.leave_type_id) },
                {
                  leave_type: model.leave_type ?? foundLeaveType.leave_type,
                  deduction_value:
                    model.deduction_value ?? foundLeaveType.deduction_value,
                }
              );
              return { data: true, status_code: HttpStatus.OK };
            } else
              return {
                status_code: HttpStatus.BAD_REQUEST,
                data: {
                  message: "This Leave Type Already Existed ",
                  Error: "On Update Error",
                },
              };
          }
        } else
          return {
            status_code: HttpStatus.BAD_REQUEST,
            data: {
              message: "Leave Type Not Found",
              Error: "On Update Error",
            },
          };
      }
    } catch (error) {
      console.log(error);

      return {
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        data: {
          message: "Internal Server Error",
          Error: "On Update Error",
        },
      };
    }
  };
  AllLeaveTypeList = async (req: Request): Promise<IServiceResult> => {
    try {
      let leaveTypeList = await LeaveTypeModel.find({});
      if (leaveTypeList && leaveTypeList.length > 0)
        return {
          status_code: HttpStatus.OK,

          data: leaveTypeList,
        };
      else
        return {
          status_code: HttpStatus.BAD_REQUEST,
          data: {
            message: "Leave Types List Not Found",
            Error: "On Fetch Error",
          },
        };
    } catch (error) {
      console.log(error);

      return {
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        data: {
          message: "Internal Server Error",
          Error: "On Fetch Error",
        },
      };
    }
  };

  //Leave Status Section

  AddLeaveStatus = async (
    req: Request,
    model: AddLeaveStatusViewmodel
  ): Promise<IServiceResult> => {
    try {
      let userDetails = <DocumentType<Employees>>req.user;
      let findRequestUserRoles = await roles.find({
        _id: { $in: userDetails.roles },
      });
      let findRequestUserRolesDetails = findRequestUserRoles.map((role) => {
        return role.name;
      });

      if (!findRequestUserRolesDetails.includes("masteradmin"))
        return {
          data: {
            message: "You Are Not Authorized For Add Leave Status",
            error: "On Add Error",
          },
          status_code: HttpStatus.UNAUTHORIZED,
        };
      else {
        let checkLeaveStatusExistence = await LeaveStatusModel.findOne({
          leave_status: model.leave_status,
        });
        if (!checkLeaveStatusExistence) {
          let modelToSave = <DocumentType<LeaveStatus>>model;
          let foundDefaultStatus = await LeaveStatusModel.findOne({
            is_default: true,
          });
          if (!foundDefaultStatus) modelToSave.is_default = true;
          else {
            if (model.is_default === true) {
              let updateDefaultStatusDoc = await LeaveStatusModel.updateOne(
                { _id: foundDefaultStatus._id },
                { is_default: false }
              );
            }
          }

          let addLeaveStatus = await LeaveStatusModel.create(modelToSave);

          if (addLeaveStatus)
            return {
              status_code: HttpStatus.OK,

              data: addLeaveStatus,
            };
          else
            return {
              status_code: HttpStatus.BAD_REQUEST,
              data: {
                message: " An Error Occurred While Adding Leave Status",
                Error: "On Add Error",
              },
            };
        } else
          return {
            status_code: HttpStatus.BAD_REQUEST,
            data: {
              message: "This Leave Status Already Existed ",
              Error: "On Add Error",
            },
          };
      }
    } catch (error) {
      console.log(error);

      return {
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        data: {
          message: "Internal Server Error",
          Error: "On Add Error",
        },
      };
    }
  };
  DeleteLeaveStatus = async (req: Request): Promise<IServiceResult> => {
    try {
      let userDetails = <DocumentType<Employees>>req.user;
      let findRequestUserRoles = await roles.find({
        _id: { $in: userDetails.roles },
      });
      let findRequestUserRolesDetails = findRequestUserRoles.map((role) => {
        return role.name;
      });

      if (!findRequestUserRolesDetails.includes("masteradmin"))
        return {
          data: {
            message: "You Are Not Authorized For Delete Leave Status",
            error: "On Delete Error",
          },
          status_code: HttpStatus.UNAUTHORIZED,
        };
      else {
        let deleteLeaveStatus = await LeaveStatusModel.deleteOne({
          _id: new mongoose.Types.ObjectId(req.params.leave_status_id),
        });

        if (deleteLeaveStatus && deleteLeaveStatus.deletedCount > 0)
          return {
            status_code: HttpStatus.OK,

            data: true,
          };
        else
          return {
            status_code: HttpStatus.BAD_REQUEST,
            data: {
              message: " An Error Occurred While Deleting Leave Status",
              Error: "On Delete Error",
            },
          };
      }
    } catch (error) {
      console.log(error);

      return {
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        data: {
          message: "Internal Server Error",
          Error: "On Delete Error",
        },
      };
    }
  };
  UpdateLeaveStatus = async (
    req: Request,
    model: UpdateLeaveStatusViewmodel
  ): Promise<IServiceResult> => {
    try {
      let userDetails = <DocumentType<Employees>>req.user;
      let findRequestUserRoles = await roles.find({
        _id: { $in: userDetails.roles },
      });
      let findRequestUserRolesDetails = findRequestUserRoles.map((role) => {
        return role.name;
      });

      if (!findRequestUserRolesDetails.includes("masteradmin"))
        return {
          data: {
            message: "You Are Not Authorized For Update Leave Status",
            error: "On Update Error",
          },
          status_code: HttpStatus.UNAUTHORIZED,
        };
      else {
        let foundLeaveStatus = await LeaveStatusModel.findById(
          model.leave_status_id
        );
        if (foundLeaveStatus) {
          let checkLeaveStatusExistence = await LeaveStatusModel.findOne({
            leave_status: model.leave_status,
          });
          if (!checkLeaveStatusExistence) {
            if (model.is_default === true) {
              let foundDefaultStatus = await LeaveStatusModel.findOne({
                is_default: true,
              });
              if (foundDefaultStatus) {
                let updateDefaultStatusDoc = await LeaveStatusModel.updateOne(
                  { _id: foundDefaultStatus._id },
                  { is_default: false }
                );
              }
            }

            if (model.is_default === false) {
              let foundAllStatus = await LeaveStatusModel.find({});
              if (foundAllStatus.length === 1)
                return {
                  data: {
                    message: "Default Status Can't Be Updated",
                    error: "On Update Error",
                  },
                  status_code: HttpStatus.BAD_REQUEST,
                };
              // else {
              //   let updateLeaveStatusIsDefault =
              //     await LeaveStatusModel.updateOne(
              //       {
              //         _id: {
              //           $ne: new mongoose.Types.ObjectId(model.leave_status_id),
              //         },
              //       },
              //       {
              //         is_default: true,
              //       }
              //     );
              // }
            }
            let updateLeaveStatus = await LeaveStatusModel.updateOne(
              { _id: new mongoose.Types.ObjectId(model.leave_status_id) },
              {
                leave_status:
                  model.leave_status ?? foundLeaveStatus.leave_status,
                is_default: model.is_default ?? foundLeaveStatus.is_default,
                leave_count_as:
                  model.leave_count_as ?? foundLeaveStatus.leave_count_as,
              }
            );

            if (updateLeaveStatus && updateLeaveStatus.modifiedCount > 0)
              return {
                status_code: HttpStatus.OK,
                data: true,
              };
            else
              return {
                status_code: HttpStatus.BAD_REQUEST,
                data: {
                  message: "Unable To Update,No Changes Have Been Made",
                  Error: "On Update Error",
                },
              };
          } else {
            if (
              checkLeaveStatusExistence._id.toString() == model.leave_status_id
            )
              return { data: true, status_code: HttpStatus.OK };
            else
              return {
                status_code: HttpStatus.BAD_REQUEST,
                data: {
                  message: "This Leave Status Already Existed ",
                  Error: "On Update Error",
                },
              };
          }
        } else
          return {
            status_code: HttpStatus.BAD_REQUEST,
            data: {
              message: "Leave Status Not Found",
              Error: "On Update Error",
            },
          };
      }
    } catch (error) {
      console.log(error);

      return {
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        data: {
          message: "Internal Server Error",
          Error: "On Update Error",
        },
      };
    }
  };
  AllLeaveStatusList = async (req: Request): Promise<IServiceResult> => {
    try {
      let leaveStatusList = await LeaveStatusModel.find({});

      if (leaveStatusList && leaveStatusList.length > 0)
        return {
          status_code: HttpStatus.OK,

          data: leaveStatusList,
        };
      else
        return {
          status_code: HttpStatus.BAD_REQUEST,
          data: {
            message: "Leave Status List Not Found",
            Error: "On Fetch Error",
          },
        };
    } catch (error) {
      console.log(error);

      return {
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        data: {
          message: "Internal Server Error",
          Error: "On Fetch Error",
        },
      };
    }
  };
  GetLeaveStatus = async (req: Request): Promise<IServiceResult> => {
    try {
      let userDetails = <DocumentType<Employees>>req.user;
      let findRequestUserRoles = await roles.find({
        _id: { $in: userDetails.roles },
      });
      let findRequestUserRolesDetails = findRequestUserRoles.map((role) => {
        return role.name;
      });

      if (!findRequestUserRolesDetails.includes("masteradmin"))
        return {
          data: {
            message: "You Are Not Authorized For Get Leave Status",
            error: "On Fetch Error",
          },
          status_code: HttpStatus.UNAUTHORIZED,
        };
      else {
        let getLeaveStatusDetails = await LeaveStatusModel.findById(
          req.params.leave_status_id
        );

        if (getLeaveStatusDetails)
          return {
            status_code: HttpStatus.OK,

            data: getLeaveStatusDetails,
          };
        else
          return {
            status_code: HttpStatus.BAD_REQUEST,
            data: {
              message: "Leave Status Not Found",
              Error: "On Fetch Error",
            },
          };
      }
    } catch (error) {
      console.log(error);

      return {
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        data: {
          message: "Internal Server Error",
          Error: "On Fetch Error",
        },
      };
    }
  };

  // Leave Reason Section
  AddLeaveReason = async (
    req: Request,
    model: AddLeaveReasonViewmodel
  ): Promise<IServiceResult> => {
    try {
      let userDetails = <DocumentType<Employees>>req.user;
      let findRequestUserRoles = await roles.find({
        _id: { $in: userDetails.roles },
      });
      let findRequestUserRolesDetails = findRequestUserRoles.map((role) => {
        return role.name;
      });

      if (!findRequestUserRolesDetails.includes("masteradmin"))
        return {
          data: {
            message: "You Are Not Authorized For Add Leave Reason",
            error: "On Add Error",
          },
          status_code: HttpStatus.UNAUTHORIZED,
        };
      else {
        let checkLeaveReasonExistence = await LeaveReasonModel.findOne({
          leave_reason: model.leave_reason,
        });
        if (!checkLeaveReasonExistence) {
          let modelToSave = <DocumentType<LeaveReason>>model;

          let addLeaveReason = await LeaveReasonModel.create(modelToSave);

          if (addLeaveReason)
            return {
              status_code: HttpStatus.OK,

              data: addLeaveReason,
            };
          else
            return {
              status_code: HttpStatus.BAD_REQUEST,
              data: {
                message: " An Error Occurred While Adding Leave Reason",
                Error: "On Add Error",
              },
            };
        } else
          return {
            status_code: HttpStatus.BAD_REQUEST,
            data: {
              message: "This Leave Reason Already Existed ",
              Error: "On Add Error",
            },
          };
      }
    } catch (error) {
      console.log(error);

      return {
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        data: {
          message: "Internal Server Error",
          Error: "On Add Error",
        },
      };
    }
  };
  DeleteLeaveReason = async (req: Request): Promise<IServiceResult> => {
    try {
      let userDetails = <DocumentType<Employees>>req.user;
      let findRequestUserRoles = await roles.find({
        _id: { $in: userDetails.roles },
      });
      let findRequestUserRolesDetails = findRequestUserRoles.map((role) => {
        return role.name;
      });

      if (!findRequestUserRolesDetails.includes("masteradmin"))
        return {
          data: {
            message: "You Are Not Authorized For Delete Leave Reason",
            error: "On Delete Error",
          },
          status_code: HttpStatus.UNAUTHORIZED,
        };
      else {
        let deleteLeaveReason = await LeaveReasonModel.deleteOne({
          _id: new mongoose.Types.ObjectId(req.params.leave_reason_id),
        });

        if (deleteLeaveReason && deleteLeaveReason.deletedCount > 0)
          return {
            status_code: HttpStatus.OK,

            data: true,
          };
        else
          return {
            status_code: HttpStatus.BAD_REQUEST,
            data: {
              message: "An Error Occurred While Deleting Leave Reason",
              Error: "On Delete Error",
            },
          };
      }
    } catch (error) {
      console.log(error);

      return {
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        data: {
          message: "Internal Server Error",
          Error: "On Delete Error",
        },
      };
    }
  };
  UpdateLeaveReason = async (
    req: Request,
    model: UpdateLeaveReasonViewmodel
  ): Promise<IServiceResult> => {
    try {
      let userDetails = <DocumentType<Employees>>req.user;
      let findRequestUserRoles = await roles.find({
        _id: { $in: userDetails.roles },
      });
      let findRequestUserRolesDetails = findRequestUserRoles.map((role) => {
        return role.name;
      });

      if (!findRequestUserRolesDetails.includes("masteradmin"))
        return {
          data: {
            message: "You Are Not Authorized For Update Leave Reason",
            error: "On Update Error",
          },
          status_code: HttpStatus.UNAUTHORIZED,
        };
      else {
        let foundLeaveReason = await LeaveReasonModel.findById(
          model.leave_reason_id
        );
        if (foundLeaveReason) {
          let checkLeaveReasonExistence = await LeaveReasonModel.findOne({
            leave_reason: model.leave_reason,
          });
          if (!checkLeaveReasonExistence) {
            let updateLeaveReason = await LeaveReasonModel.updateOne(
              { _id: new mongoose.Types.ObjectId(model.leave_reason_id) },
              {
                leave_reason: model.leave_reason,
              }
            );

            if (updateLeaveReason && updateLeaveReason.modifiedCount > 0)
              return {
                status_code: HttpStatus.OK,
                data: true,
              };
            else
              return {
                status_code: HttpStatus.BAD_REQUEST,
                data: {
                  message: "Unable To Update,No Changes Have Been Made",
                  Error: "On Update Error",
                },
              };
          } else {
            if (
              checkLeaveReasonExistence._id.toString() == model.leave_reason_id
            )
              return { data: true, status_code: HttpStatus.OK };
            else
              return {
                status_code: HttpStatus.BAD_REQUEST,
                data: {
                  message: "This Leave Reason Already Existed ",
                  Error: "On Update Error",
                },
              };
          }
        } else
          return {
            status_code: HttpStatus.BAD_REQUEST,
            data: {
              message: "Leave Reason Not Found",
              Error: "On Update Error",
            },
          };
      }
    } catch (error) {
      console.log(error);

      return {
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        data: {
          message: "Internal Server Error",
          Error: "On Update Error",
        },
      };
    }
  };
  AllLeaveReasonList = async (req: Request): Promise<IServiceResult> => {
    try {
      let leaveReasonList = await LeaveReasonModel.find({});

      if (leaveReasonList && leaveReasonList.length > 0)
        return {
          status_code: HttpStatus.OK,

          data: leaveReasonList,
        };
      else
        return {
          status_code: HttpStatus.BAD_REQUEST,
          data: {
            message: "Leave Reason List Not Found",
            Error: "On Fetch Error",
          },
        };
    } catch (error) {
      console.log(error);

      return {
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        data: {
          message: "Internal Server Error",
          Error: "On Fetch Error",
        },
      };
    }
  };

  // Leave Deduction category Section
  AddLeaveDeductionCategory = async (
    req: Request,
    model: AddLeaveDeductionCategoryViewmodel
  ): Promise<IServiceResult> => {
    try {
      let userDetails = <DocumentType<Employees>>req.user;
      let findRequestUserRoles = await roles.find({
        _id: { $in: userDetails.roles },
      });
      let findRequestUserRolesDetails = findRequestUserRoles.map((role) => {
        return role.name;
      });

      if (!findRequestUserRolesDetails.includes("masteradmin"))
        return {
          data: {
            message: "You Are Not Authorized For Add Leave Deduction Category",
            error: "On Add Error",
          },
          status_code: HttpStatus.UNAUTHORIZED,
        };
      else {
        let checkLeavDeductionCategoryExistence =
          await LeaveDeductionModel.findOne({
            name: model.name,
          });
        if (!checkLeavDeductionCategoryExistence) {
          let modelToSave = <DocumentType<LeaveDeductionCategory>>model;

          let addLeaveDeductionCategory = await LeaveDeductionModel.create(
            modelToSave
          );

          if (addLeaveDeductionCategory)
            return {
              status_code: HttpStatus.OK,

              data: addLeaveDeductionCategory,
            };
          else
            return {
              status_code: HttpStatus.BAD_REQUEST,
              data: {
                message:
                  "An Error Occurred While Adding Leave Deduction Category",
                Error: "On Add Error",
              },
            };
        } else
          return {
            status_code: HttpStatus.BAD_REQUEST,
            data: {
              message: "This Leave Deduction Category Already Existed ",
              Error: "On Add Error",
            },
          };
      }
    } catch (error) {
      console.log(error);

      return {
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        data: {
          message: "Internal Server Error",
          Error: "On Add Error",
        },
      };
    }
  };
  DeleteLeaveDeductionCategory = async (
    req: Request
  ): Promise<IServiceResult> => {
    try {
      let userDetails = <DocumentType<Employees>>req.user;
      let findRequestUserRoles = await roles.find({
        _id: { $in: userDetails.roles },
      });
      let findRequestUserRolesDetails = findRequestUserRoles.map((role) => {
        return role.name;
      });

      if (!findRequestUserRolesDetails.includes("masteradmin"))
        return {
          data: {
            message:
              "You Are Not Authorized For Delete Leave Deduction Category",
            error: "On Delete Error",
          },
          status_code: HttpStatus.UNAUTHORIZED,
        };
      else {
        let deleteLeaveDeductionCategory = await LeaveDeductionModel.deleteOne({
          _id: new mongoose.Types.ObjectId(req.params._id),
        });

        if (
          deleteLeaveDeductionCategory &&
          deleteLeaveDeductionCategory.deletedCount > 0
        )
          return {
            status_code: HttpStatus.OK,

            data: true,
          };
        else
          return {
            status_code: HttpStatus.BAD_REQUEST,
            data: {
              message:
                "An Error Occurred While Deleting Leave Deduction Category",
              Error: "On Delete Error",
            },
          };
      }
    } catch (error) {
      console.log(error);

      return {
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        data: {
          message: "Internal Server Error",
          Error: "On Delete Error",
        },
      };
    }
  };
  UpdateLeaveDeductionCategory = async (
    req: Request,
    model: UpdateLeaveDeductionCategoryViewmodel
  ): Promise<IServiceResult> => {
    try {
      let userDetails = <DocumentType<Employees>>req.user;
      let findRequestUserRoles = await roles.find({
        _id: { $in: userDetails.roles },
      });
      let findRequestUserRolesDetails = findRequestUserRoles.map((role) => {
        return role.name;
      });

      if (!findRequestUserRolesDetails.includes("masteradmin"))
        return {
          data: {
            message:
              "You Are Not Authorized For Update Leave Deduction Category",
            error: "On Update Error",
          },
          status_code: HttpStatus.UNAUTHORIZED,
        };
      else {
        let modelToSave = <DocumentType<LeaveDeductionCategory>>model;
        let foundLeaveDeductionCategory = await LeaveDeductionModel.findById(
          model._id
        );
        if (foundLeaveDeductionCategory) {
          let checkLeaveDeductionCategoryExistence =
            await LeaveDeductionModel.findOne({
              name: model.name,
            });
          if (!checkLeaveDeductionCategoryExistence) {
            let updateLeaveDeductionCategory =
              await LeaveDeductionModel.updateOne(
                { _id: new mongoose.Types.ObjectId(model._id) },

                modelToSave
              );

            if (
              updateLeaveDeductionCategory &&
              updateLeaveDeductionCategory.modifiedCount > 0
            )
              return {
                status_code: HttpStatus.OK,
                data: true,
              };
            else
              return {
                status_code: HttpStatus.BAD_REQUEST,
                data: {
                  message: "Unable To Update,No Changes Have Been Made",
                  Error: "On Update Error",
                },
              };
          } else {
            if (
              checkLeaveDeductionCategoryExistence._id.toString() == model._id
            ) {
              let updateLeaveDeductionCategory =
                await LeaveDeductionModel.updateOne(
                  { _id: new mongoose.Types.ObjectId(model._id) },

                  modelToSave
                );

              return { data: true, status_code: HttpStatus.OK };
            } else
              return {
                status_code: HttpStatus.BAD_REQUEST,
                data: {
                  message: "This Leave Deduction Category Already Existed ",
                  Error: "On Update Error",
                },
              };
          }
        } else
          return {
            status_code: HttpStatus.BAD_REQUEST,
            data: {
              message: "Leave Deduction Category Not Found",
              Error: "On Update Error",
            },
          };
      }
    } catch (error) {
      console.log(error);

      return {
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        data: {
          message: "Internal Server Error",
          Error: "On Update Error",
        },
      };
    }
  };
  AllLeaveDeductionCategoryList = async (
    req: Request
  ): Promise<IServiceResult> => {
    try {
      let leaveDeductionCategoryList = await LeaveDeductionModel.find({}, {});

      if (leaveDeductionCategoryList && leaveDeductionCategoryList.length > 0)
        return {
          status_code: HttpStatus.OK,

          data: leaveDeductionCategoryList,
        };
      else
        return {
          status_code: HttpStatus.BAD_REQUEST,
          data: {
            message: "Leave Deduction Category List Not Found",
            Error: "On Fetch Error",
          },
        };
    } catch (error) {
      console.log(error);
      return {
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        data: {
          message: "Internal Server Error",
          Error: "On Fetch Error",
        },
      };
    }
  };

  GetLeaveDeductionCategoryDetails = async (
    req: Request
  ): Promise<IServiceResult> => {
    try {
      let userDetails = <DocumentType<Employees>>req.user;
      let findRequestUserRoles = await roles.find({
        _id: { $in: userDetails.roles },
      });
      let findRequestUserRolesDetails = findRequestUserRoles.map((role) => {
        return role.name;
      });

      if (!findRequestUserRolesDetails.includes("masteradmin"))
        return {
          data: {
            message:
              "You Are Not Authorized For Get Leave Deduction Category Details",
            error: "On Fetch Error",
          },
          status_code: HttpStatus.UNAUTHORIZED,
        };
      else {
        let leaveDeductionCategoryDetails = await LeaveDeductionModel.findById(
          req.params._id
        );

        if (leaveDeductionCategoryDetails)
          return {
            status_code: HttpStatus.OK,

            data: leaveDeductionCategoryDetails,
          };
        else
          return {
            status_code: HttpStatus.BAD_REQUEST,
            data: {
              message: "Leave Deduction Category Details Not Found",
              Error: "On Fetch Error",
            },
          };
      }
    } catch (error) {
      console.log(error);
      return {
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        data: {
          message: "Internal Server Error",
          Error: "On Fetch Error",
        },
      };
    }
  };
}
export default new LeaveService();
