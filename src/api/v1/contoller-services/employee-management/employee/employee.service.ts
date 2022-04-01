import { DocumentType } from "@typegoose/typegoose";
import bcrypt from "bcrypt";
import { Request } from "express";
import fs from "fs";
import HttpStatus from "http-status-codes";
import Jimp from "jimp";
import _ from "lodash";
import moment from "moment";
import mongoose from "mongoose";
import { v4 } from "uuid";
import Utility, { IServiceResult } from "../../../common/common-methods";
import { IJWTPayload } from "../../../common/interface/jwtpayload";
import uploadService from "../../../common/upload/upload_media.service";
import employeeModel, {
  Employees
} from "../../../models/employee-management-models/employee.model";
import leaveModel from "../../../models/employee-management-models/leave.model";
import { LeaveDeductionCategory } from "../../../models/employee-management-models/leave_deduction_category.model";
import LeaveTypeModel, {
  LeaveTypes
} from "../../../models/employee-management-models/leave_type.model";
import otpModel from "../../../models/employee-management-models/login_otp";
import organizationModel, {
  Organization
} from "../../../models/employee-management-models/organization.model";
import { Profile } from "../../../models/employee-management-models/profile.model";
import { default as roles } from "../../../models/employee-management-models/roles.model";
import salaryIncrementModel, {
  EmployeesSalaryIncrement
} from "../../../models/employee-management-models/salary_increment.model";
import SalaryRuleModel, {
  SalaryRules
} from "../../../models/employee-management-models/salary_rules.model";
import sendMessage from "../../../utils/mailer1";
import {
  AddEmployeeAccountViewmodel,
  LoginViewmodel,
  ResetForgotPasswordViewmodel,
  ResetPasswordViewModel,
  UpdateEmployeeAccountViewmodel
} from "../../../view-models/employee-management-viewmodels/employee";
import { ForgotPasswordViewmodel } from "../../../view-models/employee-management-viewmodels/employee/forgot_password.viewmodel";
import {
  AddSalaryRuleViewmodel,
  CalculateEmployeeSalaryViewmodel,
  GenerateAllEmployeeSalarySlipViewmodel,
  GenerateEmployeeSalarySlipViewmodel,
  GetAllManagerListViewmodel,
  GetEmployeeSalaryIncremetListViewmodel,
  UpdateEmployeeSalaryViewmodel
} from "../../../view-models/employee-management-viewmodels/employee/salary/index";
import { UpdateSalaryRuleViewmodel } from "../../../view-models/employee-management-viewmodels/employee/salary/salary-rules/index";
const remove = require("fs-extra").remove;
const month_names = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
export enum EnumRoles {
  MANAGER = "manager",
  EMPLOYEE = "employee",
  SUPERADMIN = "superadmin",
  HR = "hr",
  MASTERADMIN = "masteradmin",
}
class EmployeeService {
  addEmployee = async (
    req: Request,
    model: AddEmployeeAccountViewmodel
  ): Promise<IServiceResult> => {
    try {
      let allRoles = await roles.find({});
      let userDetails = <DocumentType<Employees>>req.user;
      let findRequestUserRoles = await roles.find({
        _id: { $in: userDetails.roles },
      });
      let findRequestUserRolesDetails = findRequestUserRoles.map((role) => {
        return role.name;
      });

      if (
        !findRequestUserRolesDetails.some((e) =>
          [
            EnumRoles.MASTERADMIN.valueOf(),
            EnumRoles.SUPERADMIN.valueOf(),
            EnumRoles.HR.valueOf,
          ].includes(e)
        )
      )
        return {
          data: {
            message: "You Are Not Authorized For Add Employees",
            error: "On Add Error",
          },
          status_code: HttpStatus.UNAUTHORIZED,
        };
      else {
        //check whether employee personal email details found or not
        if (!model.emp_personal_email)
          return {
            data: {
              message: "emp_personal_email can not be empty or undefined",
              error: "On Add Error",
            },
            status_code: HttpStatus.BAD_REQUEST,
          };

        model.roles.push("employee");
        model.roles = _.uniq(model.roles);

        if (model.roles.includes(EnumRoles.SUPERADMIN)) {
          if (!findRequestUserRolesDetails.includes(EnumRoles.MASTERADMIN))
            return {
              data: {
                message: "You Are Not Authorized For Add SuperAdmin Employees",
                error: "On Add Error",
              },
              status_code: HttpStatus.UNAUTHORIZED,
            };
        }
        if (model.roles.includes(EnumRoles.HR)) {
          if (
            !findRequestUserRolesDetails.some((e) =>
              [
                EnumRoles.MASTERADMIN.valueOf(),
                EnumRoles.SUPERADMIN.valueOf(),
              ].includes(e)
            )
          )
            return {
              data: {
                message: "You Are Not Authorized For Add Hr Employees",
                error: "On Add Error",
              },
              status_code: HttpStatus.UNAUTHORIZED,
            };
        }

        if (model.roles.includes(EnumRoles.MANAGER || EnumRoles.EMPLOYEE)) {
          if (
            !findRequestUserRolesDetails.some((e) =>
              [
                EnumRoles.MASTERADMIN.valueOf(),
                EnumRoles.SUPERADMIN.valueOf,
                EnumRoles.HR.valueOf(),
              ].includes(e)
            )
          )
            return {
              data: {
                message: "You Are Not Authorized For Add Employees",
                error: "On Add Error",
              },
              status_code: HttpStatus.UNAUTHORIZED,
            };
        }

        let modelToSave = <DocumentType<Employees>>model;

        let foundManager = await employeeModel.find({
          _id: { $in: model.manager },
        });
        if (foundManager && foundManager.length > 0) {
          let managerIdsToSave: string[] = [];
          let allManagerIds = allRoles.map((role) => {
            if (role.name != "employee") return role._id.toString();
          });
          foundManager.forEach((manager) => {
            if (
              allManagerIds.some((x) => manager.roles.includes(x?.toString()))
            )
              managerIdsToSave.push(manager._id.toString());
            // return manager;
          });

          modelToSave.manager = managerIdsToSave;
        } else if (modelToSave.manager.length <= 0)
          modelToSave.manager = [`${userDetails._id.toString()}`];
        // return {
        //   data: { message: "Manager Not Found", error: "On Add Error" },
        //   status_code: HttpStatus.BAD_REQUEST,
        // };

        const checkEmployeeExistence = await employeeModel.findOne({
          email: model.email.toLowerCase(),
          //organization_id: model.organization_id,
        });
        if (checkEmployeeExistence) {
          return {
            data: {
              message: "Employee Already Exists With This Email",
              error: "On Add Error",
            },
            status_code: HttpStatus.BAD_REQUEST,
          };
        } else {
          let salt = await bcrypt.genSalt(11);
          //auto generate 6 charatcer password if password not provided
          let temp_password = Math.round(
            Math.pow(36, 6 + 1) - Math.random() * Math.pow(36, 6)
          )
            .toString(36)
            .slice(1);
          let password_for_employee = model.password
            ? model.password
            : temp_password;
          modelToSave.password = model.password
            ? await bcrypt.hash(model.password, salt)
            : await bcrypt.hash(temp_password, salt);
          let rolesToSave: string[] = [];
          model.roles.forEach((role) => {
            allRoles.forEach((x) => {
              if (x.name == role) rolesToSave.push(x._id);
            });
            return true;
          });
          let doj = new Date();

          modelToSave.roles = rolesToSave;
          modelToSave.email = model.email.toLowerCase();
          modelToSave.image = model.image;
          modelToSave.salary = model.salary;

          let date_obj = model.date_of_joining.setDate(
            model.date_of_joining.getDate() + 1
          );
          let joiningDate = new Date(
            moment(date_obj).format("YYYY-MM-DDTHH:mm:ss")
          );

          modelToSave.date_of_joining = model.date_of_joining
            ? joiningDate
            : doj;

          let result = await employeeModel.create(modelToSave);

          let obj = {
            to: model.emp_personal_email,
            from: "ankit@boffincoders.com",
            subject: "Login Credentials Details",
            content: ` Hello ${model.fullname},Your Login Credentials Details As Below.
         email:${model.email},
         password:${password_for_employee}`,
          };

          //notify staff manager about leave request
          sendMessage.sendMail1(obj);

          if (result) return { status_code: HttpStatus.OK, data: result };
          else
            return {
              status_code: HttpStatus.BAD_REQUEST,
              data: {
                message: "Employee Account Not Created",
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
  updateEmployee = async (
    req: Request,
    model: UpdateEmployeeAccountViewmodel
  ): Promise<IServiceResult> => {
    try {
      let foundEmployee = await employeeModel.findById(model._id);
      if (!foundEmployee)
        return {
          data: { message: "Employee Not Found", error: "On Update Error" },
          status_code: HttpStatus.BAD_REQUEST,
        };
      else {
        let allRoles = await roles.find({});
        let userDetails = <DocumentType<Employees>>req.user;

        let findRequestUserRoles = await roles.find({
          _id: { $in: userDetails?.roles },
        });
        let findRequestUserRolesDetails = findRequestUserRoles.map((role) => {
          return role.name;
        });

        if (
          !findRequestUserRolesDetails.some((e) =>
            [
              EnumRoles.MASTERADMIN.valueOf(),
              EnumRoles.SUPERADMIN.valueOf(),
              EnumRoles.HR.valueOf(),
            ].includes(e)
          ) &&
          userDetails._id.toString() != foundEmployee._id.toString()
        )
          return {
            data: {
              message: "You Are Not Authorized For Update Employee Details",
              error: "On Update Error",
            },
            status_code: HttpStatus.BAD_REQUEST,
          };
        else if (
          findRequestUserRolesDetails.some((e) =>
            [EnumRoles.SUPERADMIN.valueOf(), EnumRoles.HR.valueOf()].includes(e)
          ) &&
          userDetails.organization_id!.toString() !==
            foundEmployee.organization_id!.toString()
        )
          return {
            data: {
              message: "You Are Not Authorized For Update Employee Details",
              error: "On Update Error",
            },
            status_code: HttpStatus.BAD_REQUEST,
          };
        else {
          let modelToSave = <DocumentType<Employees>>model;

          if (model.salary) {
            if (!findRequestUserRolesDetails.includes(EnumRoles.MASTERADMIN))
              return {
                data: {
                  message: "You Are Not Authorized For Update Employees Salary",
                  error: "On Update Error",
                },
                status_code: HttpStatus.BAD_REQUEST,
              };
            else {
              modelToSave.salary = model.salary;
              let obj: EmployeesSalaryIncrement;
              let foundEmployeeSalaryDetails = await salaryIncrementModel
                .find({
                  employee_id: new mongoose.Types.ObjectId(model._id),
                })
                .sort({ updatedAt: -1 });
              if (foundEmployeeSalaryDetails.length > 0) {
                obj = {
                  employee_id: new mongoose.Types.ObjectId(model._id),
                  increment_value:
                    model.salary - foundEmployeeSalaryDetails[0]!.new_salary!,
                  increment_date: new Date(),
                  new_salary: model.salary,
                  previous_salary: foundEmployeeSalaryDetails[0]!.new_salary!,
                };

                let UpdateEmployeeSalaryDetails =
                  await salaryIncrementModel.create(obj);
              }
            }
          }

          if (model.designation) {
            modelToSave.designation = model.designation;
          }

          if (model.roles) {
            model.roles = _.uniq(model.roles);

            if (model.roles.includes(EnumRoles.SUPERADMIN)) {
              if (!findRequestUserRolesDetails.includes(EnumRoles.MASTERADMIN))
                return {
                  data: {
                    message:
                      "You Are Not Authorized For Assign SuperAdmin Role",
                    error: "On Update Error",
                  },
                  status_code: HttpStatus.UNAUTHORIZED,
                };
              else {
                let superAdminRole_id = allRoles.filter((x) => {
                  if (x.name === EnumRoles.SUPERADMIN) return x._id;
                });
                foundEmployee.roles.push(superAdminRole_id[0]._id);
                modelToSave.roles = _.uniq(foundEmployee.roles);
              }
            }

            if (model.roles.includes(EnumRoles.MANAGER)) {
              if (
                !findRequestUserRolesDetails.some((e) =>
                  [
                    EnumRoles.MASTERADMIN,
                    EnumRoles.SUPERADMIN,
                    EnumRoles.HR.valueOf(),
                  ].includes(e)
                )
              )
                return {
                  data: {
                    message: "You Are Not Authorized For Update Role",
                    error: "On Update Error",
                  },
                  status_code: HttpStatus.UNAUTHORIZED,
                };
              else {
                let adminRole_id = allRoles.filter((x) => {
                  if (x.name === EnumRoles.MANAGER) return x._id;
                });
                foundEmployee.roles.push(adminRole_id[0]._id);
                modelToSave.roles = _.uniq(foundEmployee.roles);
              }
            }
          }

          if (model.manager) {
            let allManagerIds: string[] = [];
            allRoles.forEach((role) => {
              if (role.name != "employee")
                allManagerIds.push(role._id.toString());
            });
            let foundManager = await employeeModel.find({
              _id: { $in: model.manager },
              roles: { $in: allManagerIds },
            });
            let managerIdsToSave: string[] = [];
            if (foundManager && foundManager.length > 0) {
              foundManager.forEach((manager) => {
                managerIdsToSave.push(manager._id.toString());
              });

              let existingMangerIds = _.uniq(managerIdsToSave);
              existingMangerIds = existingMangerIds.filter(
                (item) => item != model._id
              );
              modelToSave.manager =
                existingMangerIds && existingMangerIds.length > 0
                  ? existingMangerIds
                  : foundEmployee.manager;
            } else modelToSave.manager = foundEmployee.manager;
            //}
          }
          if (model.is_deleted) {
            if (
              !findRequestUserRolesDetails.some((e) =>
                [
                  EnumRoles.MASTERADMIN.valueOf(),
                  EnumRoles.SUPERADMIN.valueOf(),
                ].includes(e)
              )
            )
              modelToSave.is_deleted = foundEmployee.is_deleted;
            else modelToSave.is_deleted = model.is_deleted;
          }

          if (model.organization_id) {
            if (
              !findRequestUserRolesDetails.some((e) =>
                [
                  EnumRoles.MASTERADMIN.valueOf(),
                  EnumRoles.SUPERADMIN.valueOf(),
                ].includes(e)
              )
            )
              return {
                data: {
                  message:
                    "You Are Not Authorized For Update Employee Organization",
                  error: "On Update Error",
                },
                status_code: HttpStatus.UNAUTHORIZED,
              };
            else {
              modelToSave.organization_id = model.organization_id;
            }
          }
          if (model.date_of_joining || model.department || model.empId) {
            if (
              !findRequestUserRolesDetails.some((e) =>
                [
                  EnumRoles.MASTERADMIN.valueOf(),
                  EnumRoles.SUPERADMIN.valueOf(),
                ].includes(e)
              )
            )
              return {
                data: {
                  message:
                    "You Are Not Authorized For Update Employee Date Of Joining Or department Or EmployeeId",
                  error: "On Update Error",
                },
                status_code: HttpStatus.UNAUTHORIZED,
              };
            else {
              if (model.date_of_joining) {
                let date_obj = model.date_of_joining.setDate(
                  model.date_of_joining.getDate() + 1
                );
                let joiningDate = new Date(
                  moment(date_obj).format("YYYY-MM-DDTHH:mm:ss")
                );

                modelToSave.date_of_joining = model.date_of_joining
                  ? joiningDate
                  : foundEmployee.date_of_joining;
              }
              modelToSave.department =
                model.department ?? foundEmployee.department;
              modelToSave.empId = model.empId ?? foundEmployee.empId;
            }
          }

          modelToSave.email = foundEmployee.email;
          modelToSave.fullname = model.fullname ?? foundEmployee.fullname;
          modelToSave.image = model.image ?? foundEmployee.image;
          if (model.password) {
            let salt = await bcrypt.genSalt(11);
            modelToSave.password = await bcrypt.hash(model.password, salt);
          }
          let UpdateEmployeeAccountResult = await employeeModel.updateOne(
            { _id: model._id },
            modelToSave
          );

          if (
            UpdateEmployeeAccountResult &&
            UpdateEmployeeAccountResult.modifiedCount > 0
          )
            return { status_code: HttpStatus.OK, data: true };
          else
            return {
              status_code: HttpStatus.BAD_REQUEST,
              data: {
                message: "Unable To Update,No Changes Have Been Made",
                Error: "On Update Error",
              },
            };
          //  else {
          //   return {
          //     data: {
          //       message: "You Are Not Authorized For Update Employee Details",
          //       error: "On Update Error",
          //     },
          //     status_code: HttpStatus.UNAUTHORIZED,
          //   };
          // }
        }
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
  getEmployeeDetails = async (req: Request): Promise<IServiceResult> => {
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
          [
            EnumRoles.MASTERADMIN,
            EnumRoles.SUPERADMIN,
            EnumRoles.HR.valueOf(),
          ].includes(e)
        ) ||
        userDetails._id.toString() == req.params._id.toString()
      ) {
        let employeeDetailResult = await employeeModel.findById(req.params._id);
        if (employeeDetailResult) {
          if (
            findRequestUserRolesDetails.some((e) =>
              [EnumRoles.SUPERADMIN, EnumRoles.HR.valueOf()].includes(e)
            )
          ) {
            if (
              userDetails.organization_id!.toString() !=
              employeeDetailResult.organization_id!.toString()
            ) {
              return {
                data: {
                  message: "You Are Not Authorized For Getting Employee Detail",
                  error: "On Fetch error",
                },
                status_code: HttpStatus.UNAUTHORIZED,
              };
            } else
              return { status_code: HttpStatus.OK, data: employeeDetailResult };
          } else
            return { status_code: HttpStatus.OK, data: employeeDetailResult };
        } else
          return {
            status_code: HttpStatus.BAD_REQUEST,
            data: {
              message: "Employee Detail Not Found",
              Error: "On Fetch Error",
            },
          };
      } else
        return {
          data: {
            message: "You Are Not Authorized For Getting Employee Detail",
            error: "On Fetch Error",
          },
          status_code: HttpStatus.UNAUTHORIZED,
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
  loginEmployeeDetails = async (req: Request): Promise<IServiceResult> => {
    try {
      let userDetails = <DocumentType<Employees>>req.user;

      let employeeDetailResult = await employeeModel.findById(userDetails._id, {
        password: 0,
      });
      if (employeeDetailResult)
        return {
          data: employeeDetailResult,
          status_code: HttpStatus.OK,
        };
      else
        return {
          status_code: HttpStatus.BAD_REQUEST,
          data: {
            message: "Employee Detail Not Found",
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

  login = async (
    req: Request,
    model: LoginViewmodel
  ): Promise<IServiceResult> => {
    try {
      const found_employee = await employeeModel.findOne({
        email: model.email.toLowerCase(),
      });
      if (!found_employee) {
        return {
          status_code: HttpStatus.BAD_REQUEST,

          data: {
            message: "Employee Not Found",
            Error: "On Fetch Error",
          },
        };
      } else {
        let comparePasswordResult = await bcrypt.compare(
          model.password,
          found_employee.password ?? ""
        );

        if (comparePasswordResult) {
          let tokenPayload: IJWTPayload = {
            email: found_employee.email,
            user_id: found_employee._id,
            roles: found_employee.roles,
          };
          let signtoken = Utility.signJWT(tokenPayload, "30d");
          let allRoles = await roles.find(
            { _id: { $in: found_employee.roles } },
            { _id: 0, name: 1 }
          );
          let roleResult: any = [];
          allRoles.forEach((_role) => {
            roleResult.push(_role.name);
          });
          return {
            status_code: HttpStatus.OK,
            data: {
              user: found_employee.email,
              token: signtoken,
              roles: roleResult,
            },
          };
        } else {
          return {
            data: {
              message: "InCorrect Password",
              error: "On LogIn Error",
            },
            status_code: HttpStatus.BAD_REQUEST,
          };
        }
      }
    } catch (error) {
      return {
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        data: {
          message: "Internal Server Error",
          Error: "On Add Error",
        },
      };
    }
  };
  forgotPassword = async (
    req: Request,
    model: ForgotPasswordViewmodel
  ): Promise<IServiceResult> => {
    try {
      const found_employee = await employeeModel.findOne({
        email: model.email.toLowerCase(),
      });
      if (!found_employee) {
        return {
          status_code: HttpStatus.BAD_REQUEST,
          data: {
            message: "Employee Not Found",
            Error: "On Fetch Error",
          },
        };
      } else {
        let foundAlreadyGeneratedOtp = await otpModel
          .find({
            emp_id: new mongoose.Types.ObjectId(found_employee._id),
          })
          .sort({ updatedAt: -1 });

        if (foundAlreadyGeneratedOtp[0]) {
          let createdAt = foundAlreadyGeneratedOtp[0].otp_generation_time;
          let now_time = new Date().getTime();
          let differenceOfTime = now_time - createdAt;
          let previous_otp_sent_before = Math.floor(differenceOfTime / 1000);
          console.log(createdAt, differenceOfTime, previous_otp_sent_before);
          if (previous_otp_sent_before < 31)
            return {
              status_code: HttpStatus.BAD_REQUEST,
              data: {
                message: "Please Wait For 30 Seconds To Generate New OTP",
                error: "On Login Error",
              },
            };
        }

        let is_otp_sent: boolean = false;

        let otp = Math.floor(1000 + Math.random() * 9000);
        let otpInstance = {
          emp_id: new mongoose.Types.ObjectId(found_employee._id),
          otp: otp,
          otp_generation_time: new Date(),
        };

        let obj = {
          to: found_employee.emp_personal_email,

          from: "ankit@boffincoders.com",
          subject: `OTP Details For LogIn`,
          content: `Hello ${found_employee.fullname}, Your OTP for Login is as below .
          otp:${otp}
          note: This otp valid for 10 minutes,
          `,
        };

        //notify staff manager about OTP
        sendMessage.sendMail1(obj);
        is_otp_sent = true;
        if (is_otp_sent) {
          let otpRecord = await otpModel.create(otpInstance);
          return {
            status_code: HttpStatus.OK,
            data: "OTP sent to your personal email id and valid for 10 minutes",
          };
        } else
          return {
            status_code: HttpStatus.BAD_REQUEST,
            data: {
              message: "Unable to send OTP to your personal email id",
              error: "On Login Error",
            },
          };
      }
    } catch (error) {
      return {
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        data: {
          message: "Internal Server Error",
          Error: "On LogIn Error",
        },
      };
    }
  };
  reset_forgot_password = async (
    model: ResetForgotPasswordViewmodel
  ): Promise<IServiceResult> => {
    try {
      let found_employee = await employeeModel.findOne({
        email: model.email.toLowerCase(),
      });

      if (found_employee) {
        let foundOtpDocument = await otpModel.findOne({
          emp_id: new mongoose.Types.ObjectId(found_employee._id),
          otp: model.otp,
        });

        if (foundOtpDocument) {
          let createdAt = foundOtpDocument.otp_generation_time;
          let now_time = new Date().getTime();
          let differenceOfTime = now_time - createdAt;

          let previous_otp_generate_before = Math.floor(
            differenceOfTime / 1000
          );

          if (previous_otp_generate_before > 600)
            return {
              status_code: HttpStatus.BAD_REQUEST,
              data: {
                message: "OTP Expired",
                error: "On Login Error",
              },
            };
          else {
            let salt = await bcrypt.genSalt(11);
            let new_password = await bcrypt.hash(model.new_password, salt);
            let result = await employeeModel.updateOne(
              { email: found_employee.email },
              { password: new_password }
            );
            if (result && result.modifiedCount > 0) {
              return {
                status_code: HttpStatus.OK,
                data: "Password Updated Successfully",
              };
            } else
              return {
                status_code: HttpStatus.BAD_REQUEST,
                data: {
                  message: "Unbale To Update New Password",
                  error: "On Update Error",
                },
              };
          }
        } else
          return {
            status_code: HttpStatus.BAD_REQUEST,
            data: {
              message: "No Otp Found For This Employee",
              error: "On Fetch Error",
            },
          };
      } else
        return {
          status_code: HttpStatus.BAD_REQUEST,
          data: {
            message: "Employee Not Found With This Email",
            error: "On Fetch Error",
          },
        };
    } catch (error) {
      return {
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        data: {
          message: "Internal Server Error",
          Error: "On Fetch Error",
        },
      };
    }
  };

  resetPassword = async (
    req: Request,
    model: ResetPasswordViewModel
  ): Promise<IServiceResult> => {
    try {
      let foundEmloyee = await employeeModel.findOne({
        email: model.email.toLowerCase(),
      });
      if (!foundEmloyee)
        return {
          data: { message: "Employee Not Found", error: "On Add Error" },
          status_code: HttpStatus.BAD_REQUEST,
        };
      else {
        let isAuthenticateEmployee = await bcrypt.compare(
          model.password,
          foundEmloyee.password!
        );
        if (isAuthenticateEmployee) {
          let salt = await bcrypt.genSalt(11);
          let temp_password = await bcrypt.hash(model.new_password, salt);

          let updateEmployeePassword = await employeeModel.updateOne(
            { _id: new mongoose.Types.ObjectId(foundEmloyee._id) },
            { password: temp_password }
          );
          if (updateEmployeePassword.modifiedCount > 0)
            return {
              data: true,
              status_code: HttpStatus.OK,
            };
          else
            return {
              data: {
                message: "An Error occurred While Reset Password",
                error: "On Update Error",
              },
              status_code: HttpStatus.BAD_REQUEST,
            };
        } else
          return {
            data: {
              message: "Password Not Matched",
              error: "On Update Error",
            },
            status_code: HttpStatus.BAD_REQUEST,
          };
      }
    } catch (error) {
      return {
        data: {
          message: "Internal Server Error",
          error: "On Update Error",
        },
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  };

  //list satff so when manager wants to check their satff members
  staffListUnderStaff = async (req: Request): Promise<IServiceResult> => {
    try {
      let userDetails = <DocumentType<Employees>>req.user;

      const found_staff_list = await employeeModel.find(
        {
          manager: userDetails._id,
        },
        { password: 0 }
      );
      let resultaArray: any = [];
      // if (found_staff_list && found_staff_list.length > 0)
      let finalResult: any = [];
      if (found_staff_list && found_staff_list.length > 0) {
        //changes manager array string to objectIds array
        let tempResult: any = [];
        found_staff_list.forEach((_employee: any) => {
          let managerArray: any = [];
          _employee.manager.forEach((obj: any) => {
            let newObj = new mongoose.Types.ObjectId(obj);
            managerArray.push(newObj);
          });
          _employee.manager = managerArray;
          tempResult.push(_employee);

          //changes role array string to objectIds array

          let rolesArray: any = [];
          _employee.roles.forEach((obj: any) => {
            let newObj = new mongoose.Types.ObjectId(obj);
            rolesArray.push(newObj);
          });
          _employee.roles = rolesArray;
          tempResult.push(_employee);
        });

        finalResult = await employeeModel
          .find(
            { _id: { $in: tempResult } },
            {
              _id: 1,
              fullname: 1,
              manager: 1,
              email: 1,
              roles: 1,
              organization_id: 1,
              designation: 1,
            }
          )
          .populate([
            { path: "manager", select: { fullname: 1, _id: 0 } },
            { path: "organization_id", select: { name: 1 } },
            { path: "designation", select: { name: 1 } },
            { path: "roles", select: { name: 1, _id: 0 } },
          ]);

        let role_Array: any = [];
        let manager_Array: any = [];

        finalResult.forEach((obj: any) => {
          //role details
          role_Array = obj.roles.map((x: any) => {
            return x.name;
          });

          obj.roles = undefined;
          //manager details

          manager_Array = obj.manager.map((x: any) => {
            return x.fullname;
          });
          obj.manager = undefined;
          resultaArray.push({
            ...obj.toObject(),
            roles: role_Array,
            manager: manager_Array,
          });
        });

        return {
          status_code: HttpStatus.OK,
          data: resultaArray,
        };
      } else
        return {
          data: {
            message: "Staff List Not Found",
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

  allEmployeeList = async (req: Request): Promise<IServiceResult> => {
    try {
      let foundEmployeeList;
      if (req.params.organization_id) {
        foundEmployeeList = await employeeModel.find({
          manager: { $exists: true },
          organization_id: new mongoose.Types.ObjectId(
            req.params.organization_id
          ),
        });
      } else {
        foundEmployeeList = await employeeModel.find(
          {
            manager: { $exists: true },
          },

          { password: 0 }
        );
      }
      if (foundEmployeeList && foundEmployeeList.length > 0)
        return {
          status_code: HttpStatus.OK,
          data: foundEmployeeList,
        };
      else
        return {
          data: {
            message: "Employees List Not Found",
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

  allEmployeeDetails = async (req: Request): Promise<IServiceResult> => {
    try {
      let userDetails = <DocumentType<Employees>>req.user;
      let allroles = await roles.find({});
      let superAdminId: string = "",
        hrId: string = "",
        managerId: string = "",
        masterAdminId: string = "",
        employeeId: string = "";
      allroles.forEach((role) => {
        if (role.name == EnumRoles.SUPERADMIN.toString())
          superAdminId = role._id.toString();
        else if (role.name == EnumRoles.MASTERADMIN)
          masterAdminId = role._id.toString();
        else if (role.name == EnumRoles.HR) hrId = role._id.toString();
        else if (role.name == EnumRoles.MANAGER)
          managerId = role._id.toString();
        else if (role.name == EnumRoles.EMPLOYEE)
          employeeId = role._id.toString();
      });
      let org_id;
      if (userDetails && userDetails.organization_id) {
        org_id = userDetails.organization_id!.toString();
      }

      let foundEmployeeList;
      //check login user role
      let findRequestUserRoles = await roles.find({
        _id: { $in: userDetails!.roles },
      });
      let findRequestUserRolesDetails = findRequestUserRoles.map((role) => {
        return role._id.toString();
      });
      //For Master Admin
      if (
        findRequestUserRolesDetails.some((e) => [masterAdminId].includes(e))
      ) {
        if (req.params.organization_id) {
          foundEmployeeList = await employeeModel.find({
            manager: { $exists: true },
            roles: { $nin: [masterAdminId] },
            organization_id: new mongoose.Types.ObjectId(
              req.params.organization_id
            ),
          });
        } else {
          foundEmployeeList = await employeeModel.find({
            manager: { $exists: true },
            roles: { $nin: [masterAdminId] },
          });
        }
      }
      //For Super Admin
      else if (
        findRequestUserRolesDetails.some((e) => [superAdminId].includes(e))
      ) {
        foundEmployeeList = await employeeModel.find({
          //manager: { $exists: true },
          roles: { $nin: [superAdminId, masterAdminId] },

          organization_id: new mongoose.Types.ObjectId(org_id),
        });
      }
      //For HR
      else if (findRequestUserRolesDetails.some((e) => [hrId].includes(e))) {
        foundEmployeeList = await employeeModel.find({
          manager: { $exists: true },
          roles: { $nin: [superAdminId, hrId, masterAdminId] },
          organization_id: new mongoose.Types.ObjectId(org_id),
        });
      }

      //For Manager
      else if (
        findRequestUserRolesDetails.some((e) => [managerId].includes(e))
      ) {
        console.log(userDetails._id.toString());

        foundEmployeeList = await employeeModel.find({
          manager: { $in: [userDetails._id.toString()] },
        });
      }
      //For Employee Itself
      else {
        if (
          findRequestUserRolesDetails.length == 1 &&
          findRequestUserRolesDetails[0] == employeeId
        )
          foundEmployeeList = await employeeModel.find({
            _id: new mongoose.Types.ObjectId(userDetails._id.toString()),
          });
      }
      //assign organization name and designation name in received result

      let finalResult: any = [];
      if (foundEmployeeList && foundEmployeeList.length > 0) {
        //changes manager array string to objectIds array
        let tempResult: any = [];
        foundEmployeeList.forEach((_employee: any) => {
          let managerArray: any = [];
          _employee.manager.forEach((obj: any) => {
            let newObj = new mongoose.Types.ObjectId(obj);
            managerArray.push(newObj);
          });
          _employee.manager = managerArray;
          tempResult.push(_employee);

          //changes role array string to objectIds array

          let rolesArray: any = [];
          _employee.roles.forEach((obj: any) => {
            let newObj = new mongoose.Types.ObjectId(obj);
            rolesArray.push(newObj);
          });
          _employee.roles = rolesArray;
          tempResult.push(_employee);
        });

        finalResult = await employeeModel
          .find(
            { _id: { $in: tempResult } },
            {
              _id: 1,
              fullname: 1,
              manager: 1,
              email: 1,
              roles: 1,
              organization_id: 1,
              designation: 1,
            }
          )
          .populate([
            { path: "manager", select: { fullname: 1, _id: 0 } },
            { path: "organization_id", select: { name: 1 } },
            { path: "designation", select: { name: 1 } },
            { path: "roles", select: { name: 1, _id: 0 } },
          ]);
      }
      let resultaArray: any = [];
      let role_Array: any = [];
      let manager_Array: any = [];

      finalResult.forEach((obj: any) => {
        //role details
        role_Array = obj.roles.map((x: any) => {
          return x.name;
        });

        obj.roles = undefined;
        //manager details

        manager_Array = obj.manager.map((x: any) => {
          return x.fullname;
        });
        obj.manager = undefined;
        resultaArray.push({
          ...obj.toObject(),
          roles: role_Array,
          manager: manager_Array,
        });
      });
      console.log(resultaArray.length);

      if (foundEmployeeList)
        return {
          status_code: HttpStatus.OK,
          data: resultaArray,
        };
      else
        return {
          data: {
            message: "Employees List Not Found",
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
  allManagerList = async (
    req: Request,
    model: GetAllManagerListViewmodel
  ): Promise<IServiceResult> => {
    try {
      let allroles = await roles.find({});
      let managerId, masterAdminId: string;
      allroles.forEach((role) => {
        if (role.name == EnumRoles.MASTERADMIN)
          masterAdminId = role._id.toString();
        else if (role.name == EnumRoles.MANAGER)
          managerId = role._id.toString();
      });
      let userDetails = <DocumentType<Employees>>req.user;

      let findRequestUserRoles = await roles.find({
        _id: { $in: userDetails!.roles },
      });
      let findRequestUserRolesDetails = findRequestUserRoles.map((role) => {
        return role._id.toString();
      });
      //For Master Admin
      if (
        findRequestUserRolesDetails.some((e) =>
          [`${masterAdminId}`].includes(e)
        )
      ) {
        let foundManagerList = await employeeModel.find(
          {
            manager: { $exists: true },
            organization_id: new mongoose.Types.ObjectId(model.organization_id),
            roles: { $in: managerId },
          },
          { fullname: 1, email: 1 }
        );

        if (foundManagerList && foundManagerList.length > 0)
          return {
            status_code: HttpStatus.OK,
            data: foundManagerList,
          };
        else
          return {
            data: {
              message: "Manager List Not Found",
              error: "On Fetch Error",
            },
            status_code: HttpStatus.BAD_REQUEST,
          };
      } else {
        let foundOrganization = await organizationModel.findById(
          model.organization_id
        );
        if (foundOrganization) {
          if (
            userDetails &&
            userDetails.organization_id!.toString() ==
              model.organization_id!.toString()
          ) {
            let foundManagerList = await employeeModel.find(
              {
                manager: { $exists: true },
                organization_id: new mongoose.Types.ObjectId(
                  model.organization_id
                ),
                roles: { $in: managerId },
              },
              { fullname: 1, email: 1 }
            );

            if (foundManagerList && foundManagerList.length > 0)
              return {
                status_code: HttpStatus.OK,
                data: foundManagerList,
              };
            else
              return {
                data: {
                  message: "Manager List Not Found",
                  error: "On Fetch Error",
                },
                status_code: HttpStatus.BAD_REQUEST,
              };
          }
          //}
          else
            return {
              data: {
                message:
                  "You Are not Authorized To Get All Managers List Of This Organization",
                error: "On Fetch Error",
              },
              status_code: HttpStatus.BAD_REQUEST,
            };
        } else
          return {
            data: {
              message: "Organization Not Found",
              error: "On Fetch Error",
            },
            status_code: HttpStatus.BAD_REQUEST,
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

  //all role list
  allRoleList = async (req: Request): Promise<IServiceResult> => {
    try {
      let userDetails = <DocumentType<Employees>>req.user;
      let findRequestUserRoles = await roles.find({
        _id: { $in: userDetails.roles },
      });
      let findRequestUserRolesDetails = findRequestUserRoles.map((role) => {
        return role.name;
      });
      let allRoles = await roles.find({}, { _id: 0 });
      let foundEmployeeRoleList: any = [];

      allRoles.forEach((role) => {
        foundEmployeeRoleList.push(role.name);
      });

      if (
        findRequestUserRolesDetails.some((e) =>
          [EnumRoles.MASTERADMIN.valueOf()].includes(e)
        )
      ) {
        _.remove(foundEmployeeRoleList, function (role) {
          return role === EnumRoles.MASTERADMIN;
        });
      } else if (
        findRequestUserRolesDetails.some((e) =>
          [EnumRoles.SUPERADMIN.valueOf()].includes(e)
        )
      ) {
        _.remove(foundEmployeeRoleList, function (role) {
          return (
            role === EnumRoles.MASTERADMIN || role === EnumRoles.SUPERADMIN
          );
        });
      } else if (
        findRequestUserRolesDetails.some((e) =>
          [EnumRoles.MANAGER.valueOf()].includes(e)
        )
      ) {
        _.remove(foundEmployeeRoleList, function (role) {
          return (
            role === EnumRoles.MASTERADMIN ||
            role === EnumRoles.SUPERADMIN ||
            role === EnumRoles.HR ||
            role === EnumRoles.MANAGER
          );
        });
      } else if (
        findRequestUserRolesDetails.some((e) =>
          [EnumRoles.HR.valueOf()].includes(e)
        )
      ) {
        _.remove(foundEmployeeRoleList, function (role) {
          return (
            role === EnumRoles.MASTERADMIN ||
            role === EnumRoles.SUPERADMIN ||
            role === EnumRoles.HR
          );
        });
      } else if (
        findRequestUserRolesDetails.some((e) => ["employee"].includes(e)) &&
        findRequestUserRolesDetails.length == 1
      ) {
        foundEmployeeRoleList = [];
      }

      if (foundEmployeeRoleList) {
        return {
          status_code: HttpStatus.OK,
          data: foundEmployeeRoleList,
        };
      } else
        return {
          data: {
            message: "Employees Role List Not Found",
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

  allRoleCollection = async (): Promise<IServiceResult> => {
    try {
      let foundRoleList = await roles.find({});

      if (foundRoleList) {
        return {
          status_code: HttpStatus.OK,
          data: foundRoleList,
        };
      } else
        return {
          data: {
            message: "Employees Role List Not Found",
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
  //salary

  updateEmployeeSalary = async (
    req: Request,
    model: UpdateEmployeeSalaryViewmodel
  ): Promise<IServiceResult> => {
    try {
      let userDetails = <DocumentType<Employees>>req.user;
      let findRequestUserRoles = await roles.find({
        _id: { $in: userDetails.roles },
      });
      let findRequestUserRolesDetails = findRequestUserRoles.map((role) => {
        return role.name;
      });

      if (!findRequestUserRolesDetails.includes(EnumRoles.MASTERADMIN))
        return {
          data: {
            message: "You Are Not Authorized For Update Employee Salary",
            error: "On Update Error",
          },
          status_code: HttpStatus.UNAUTHORIZED,
        };
      else {
        let modelToSave = <DocumentType<EmployeesSalaryIncrement>>model;

        let foundEmployee = await employeeModel.findById(model.employee_id);
        if (!foundEmployee)
          return {
            data: {
              message: "Employee Not Found",
              error: "On Update Error",
            },
            status_code: HttpStatus.BAD_REQUEST,
          };
        else {
          let newSalary = foundEmployee.salary + model.increment_value;
          modelToSave.new_salary = newSalary;
          modelToSave.previous_salary = foundEmployee.salary;
          modelToSave.increment_value = model.increment_value;
          modelToSave.increment_date = new Date();

          let updateEmployeeDetails = await employeeModel.updateOne(
            { _id: foundEmployee._id },
            { salary: newSalary }
          );

          let UpdateEmployeeSalaryResult = await salaryIncrementModel.create(
            modelToSave
          );

          if (UpdateEmployeeSalaryResult)
            return { status_code: HttpStatus.OK, data: true };
          else
            return {
              status_code: HttpStatus.BAD_REQUEST,
              data: {
                message: " An Error Occurred While Update Employee Salary",
                Error: "On Update Error",
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
          Error: "On Update Error",
        },
      };
    }
  };
  getSalaryIncrementHistory = async (
    req: Request,
    model: GetEmployeeSalaryIncremetListViewmodel
  ): Promise<IServiceResult> => {
    try {
      let userDetails = <DocumentType<Employees>>req.user;
      let findRequestUserRoles = await roles.find({
        _id: { $in: userDetails.roles },
      });
      let findRequestUserRolesDetails = findRequestUserRoles.map((role) => {
        return role.name;
      });

      if (
        findRequestUserRolesDetails.includes(EnumRoles.MASTERADMIN) ||
        userDetails._id.toString() == model.employee_id!.toString()
      ) {
        let foundEmployee = await employeeModel.findById(model.employee_id);
        if (!foundEmployee)
          return {
            data: {
              message: "Employee Not Found",
              error: "On Fetch Error",
            },
            status_code: HttpStatus.BAD_REQUEST,
          };
        else {
          let employeeSalaryHistory = await salaryIncrementModel
            .find({
              employee_id: foundEmployee._id,
            })
            .sort({ updatedAt: -1 });
          let resultList: any = [];
          employeeSalaryHistory.forEach((salary_doc) => {
            let today = salary_doc.increment_date;

            let finalDate =
              today.getDate() +
              "-" +
              (today.getMonth() + 1) +
              "-" +
              today.getFullYear();

            let obj = {
              employee_id: salary_doc.employee_id,
              increment_value: salary_doc.increment_value,
              increment_date: finalDate,
              previous_salary: salary_doc.previous_salary,
              new_salary: salary_doc.new_salary,
            };
            resultList.push(obj);
          });
          let lastIncrementDetails = {
            lastIncrementDetails: `last_increment provided on ${resultList[0].increment_date} ,increment_amount:${resultList[0].increment_value}`,
          };
          if (employeeSalaryHistory && employeeSalaryHistory.length > 0)
            return {
              data: { list: lastIncrementDetails, resultList },
              status_code: HttpStatus.OK,
            };
          else
            return {
              data: {
                message: "Salary Increment Detail Not Found",
                error: "On Fetch Error",
              },
              status_code: HttpStatus.BAD_REQUEST,
            };
        }
      } else
        return {
          data: {
            message:
              "You Are Not Authorized For Getting Employee Salary Increment List",
            error: "On Fetch Error",
          },
          status_code: HttpStatus.UNAUTHORIZED,
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

  //calculate salary with leave deduction

  generateEmployeeSalarySlip = async (
    req: Request,
    model: GenerateEmployeeSalarySlipViewmodel
  ): Promise<IServiceResult> => {
    try {
      let userDetails = <DocumentType<Employees>>req.user;
      let findRequestUserRoles = await roles.find({
        _id: { $in: userDetails.roles },
      });
      let findRequestUserRolesDetails = findRequestUserRoles.map((role) => {
        return role.name;
      });
      let foundEmployeeDetails = await employeeModel
        .findById(model.employee_id)
        .populate(["designation", "organization_id"]);
      if (!foundEmployeeDetails)
        return {
          data: { message: "Employee Not Found", error: "On Fetch Error" },
          status_code: HttpStatus.BAD_REQUEST,
        };
      if (
        !findRequestUserRolesDetails.includes(EnumRoles.MASTERADMIN) ||
        !userDetails._id.toString() == foundEmployeeDetails._id.toString()
      )
        return {
          data: {
            message:
              "You Are Not Authorized For Generate Salary Slip Of This Employee",
            error: "On Fetch Error",
          },
          status_code: HttpStatus.UNAUTHORIZED,
        };
      else {
        let monthDetails =
          month_names[model.month - 1] + "," + model.year + " Salary Details";
        let foundRuleList = await SalaryRuleModel.find({});
        let salaryDetails = await this.EmployeeSalaryWithRulesNew(req, model);

        if (salaryDetails.data.message)
          return {
            data: {
              message: salaryDetails.data.message, // "Salary Details Not Found For This Employee",
              error: "On Fetch Error",
            },
            status_code: HttpStatus.BAD_REQUEST,
          };
        // let finalDateofJoining = moment(
        //   foundEmployeeDetails.date_of_joining
        // ).format("LL");

        let date_obj = foundEmployeeDetails.date_of_joining.setDate(
          foundEmployeeDetails.date_of_joining.getDate()
        );

        let joiningDate = moment(date_obj).format("LL");

        let organizationInfo = <DocumentType<Organization>>(
          foundEmployeeDetails.organization_id
        );
        let designationInfo = <DocumentType<Profile>>(
          foundEmployeeDetails.designation
        );

        if (!organizationInfo)
          return {
            data: {
              message: "Organization Info Not Found",
              error: "On Fetch Error",
            },
            status_code: HttpStatus.BAD_REQUEST,
          };

        // for resume space balance in all feilds while creating salary slip pdf
        if (foundEmployeeDetails.bank_name == "")
          foundEmployeeDetails.bank_name = " ";
        if (foundEmployeeDetails.department == "")
          foundEmployeeDetails.department = " ";
        if (foundEmployeeDetails.pf_no == "") foundEmployeeDetails.pf_no = "  ";

        if (foundEmployeeDetails.uan == "") foundEmployeeDetails.uan = "  ";

        if (foundEmployeeDetails.esi_no == "")
          foundEmployeeDetails.esi_no = "  ";

        if (foundEmployeeDetails.empId == "") foundEmployeeDetails.empId = "  ";
        if (foundEmployeeDetails.bank_acc_no == "")
          foundEmployeeDetails.bank_acc_no = "  ";

        //
        let salarySlipObj = {
          _id: foundEmployeeDetails._id,
          fullname: foundEmployeeDetails.fullname,
          manager: foundEmployeeDetails.manager,
          email: foundEmployeeDetails.email,
          roles: foundEmployeeDetails.roles,
          is_deleted: foundEmployeeDetails.is_deleted,
          salary: foundEmployeeDetails.salary,
          image: foundEmployeeDetails.image,
          BankAccNo: foundEmployeeDetails.bank_acc_no,
          EmpId: foundEmployeeDetails.empId,
          Designation: designationInfo.name,
          Doj: joiningDate, //finalDateofJoining,
          EsiNo: foundEmployeeDetails.esi_no,
          UAN: foundEmployeeDetails.uan,
          PFNO: foundEmployeeDetails.pf_no,
          Department: foundEmployeeDetails.department,
          BankName: foundEmployeeDetails.bank_name,
          totalWorkingdays:
            salaryDetails.data.LeaveHistoryThisMonth.TotalWorkingDays,
          TotalPaidLeaves:
            salaryDetails.data.LeaveHistoryThisMonth.TotalPaidLeaves,
          TotalUnpaidLeaves:
            salaryDetails.data.LeaveHistoryThisMonth.TotalUnpaidLeaves,
          leavetaken: salaryDetails.data.LeaveHistoryThisMonth.TotalLeave,
          organization_id: organizationInfo!._id!.toString(), //foundEmployeeDetails.organization_id!.toString(),
          orgaization_name: organizationInfo.name, //organizationInfo.data.name,
          orgaization_address: organizationInfo.address, // organizationInfo.data.address,
          orgaization_email: organizationInfo.address, //organizationInfo.data.address,
          orgaization_logo: organizationInfo.logo, //organizationInfo.data.logo,
          orgaization_mobile_number: organizationInfo.mobile_number, //organizationInfo.data.mobile_number,
          MonthDetails: monthDetails,
          salaryDetails: salaryDetails,
          foundRuleList: foundRuleList,
        };

        let result = await this.createSalarySlipPDf(salarySlipObj);
        if (result.data.message)
          return {
            data: result.data,
            status_code: HttpStatus.BAD_REQUEST,
          };
        else
          return {
            data: result.data,
            status_code: HttpStatus.OK,
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
  EmployeeSalaryWithRulesNew = async (
    req: Request,
    model: CalculateEmployeeSalaryViewmodel
  ): Promise<IServiceResult> => {
    try {
      let userDetails = <DocumentType<Employees>>req.user;
      let findRequestUserRoles = await roles.find({
        _id: { $in: userDetails.roles },
      });
      let findRequestUserRolesDetails = findRequestUserRoles.map((role) => {
        return role.name;
      });

      if (!findRequestUserRolesDetails.includes(EnumRoles.MASTERADMIN))
        return {
          data: {
            message: "You Are Not Authorized For Calculate Employee Salary",
            error: "On Fetch Error",
          },
          status_code: HttpStatus.UNAUTHORIZED,
        };
      else {
        let operandsCheckFlag = false;
        let foundEmployee = await employeeModel.findById(model.employee_id);

        if (!foundEmployee)
          return {
            data: { message: "Employee Not Found", error: "On Fetch Error" },
            status_code: HttpStatus.BAD_REQUEST,
          };
        else {
          let currentMonth = new Date().getMonth() + 1;
          let currentYear = new Date().getFullYear();
          let invalidMonthValue =
            (model.month >= currentMonth && model.year == currentYear) ||
            (model.month <= foundEmployee.date_of_joining.getMonth() + 1 &&
              model.year == foundEmployee.date_of_joining.getFullYear()) ||
            (model.month <= foundEmployee.date_of_joining.getMonth() + 1 &&
              model.year < foundEmployee.date_of_joining.getFullYear())
              ? true
              : false;

          let invalidYearValue =
            model.year > currentYear ||
            model.year < foundEmployee.date_of_joining.getFullYear()
              ? true
              : false;

          if (invalidMonthValue || invalidYearValue)
            return {
              data: {
                message: `${
                  foundEmployee.fullname
                }'s Salary Can Not Calculate For  ${
                  month_names[model.month - 1]
                },${model.year}`,
                error: "On Fetch Error",
              },
              status_code: HttpStatus.BAD_REQUEST,
            };

          let leaveHistoryThisMonth: any[] = [];
          let totalDaysInMonth = Utility.daysInMonth(model.month, model.year);
          totalDaysInMonth;

          //total sunday and Saturday In this month

          let totalSundays = Utility.countSpecificDayInMonth(
            model.year,
            model.month - 1,
            0
          );
          let totalSaturdays = Utility.countSpecificDayInMonth(
            model.year,
            model.month - 1,
            6
          );
          //

          let totalWorkingDays =
            totalDaysInMonth - totalSundays - totalSaturdays;

          let singleDaySalary = foundEmployee.salary / totalDaysInMonth;
          let totalLeaveAmountToBeDeduct = 0;

          let leaveTypeList = await LeaveTypeModel.find(
            {},
            { _id: 1, leave_type: 1, deduction_value: 1 }
          );

          let foundTotalLeave = await leaveModel
            .find({
              employee_id: model.employee_id,
              leave_count_as: true,
            })
            .populate(["deduction_category", "leave_type"]);

          let totalLeavesCount = 0;

          let single_leave = 1;
          leaveTypeList.forEach((type) => {
            let countvalue = 0;
            foundTotalLeave.forEach((leave) => {
              if (leave.leave_count_as == true) {
                if (
                  new Date(leave.from_date).getMonth() + 1 === model.month &&
                  new Date(leave.to_date).getMonth() + 1 === model.month &&
                  new Date(leave.from_date).getFullYear() == model.year &&
                  new Date(leave.to_date).getFullYear() == model.year
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
                    totalLeavesCount += leave_days;
                }
              }

              //
              let leaveDeduct = <DocumentType<LeaveDeductionCategory>>(
                leave["deduction_category"]
              );
              if (leaveDeduct.money_deduct == true) {
                if (
                  new Date(leave.from_date).getMonth() + 1 === model.month &&
                  new Date(leave.to_date).getMonth() + 1 === model.month &&
                  new Date(leave.from_date).getFullYear() == model.year &&
                  new Date(leave.to_date).getFullYear() == model.year
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
              }
            });

            let foundDeductionPercentage = leaveTypeList.find(
              (element) => type.leave_type == element.leave_type
            );
            let deductAmountvalue = (
              (foundDeductionPercentage!.deduction_value *
                countvalue *
                singleDaySalary) /
              100
            ).toFixed(0);
            totalLeaveAmountToBeDeduct += parseInt(deductAmountvalue);
            let obj = {
              name: type.leave_type,
              count: countvalue,
              deducted_amount: parseInt(deductAmountvalue),
            };

            leaveHistoryThisMonth.push(obj);
          });
          //calculate leave  days for that amount to be deducted from salary
          let totalLeaveAmountDeductedDays = 0;
          let leaveResult = leaveHistoryThisMonth.filter((leaveObj) => {
            if (leaveObj.deducted_amount !== 0)
              totalLeaveAmountDeductedDays += leaveObj.count;
            if (leaveObj.count !== 0) return leaveObj;
          });
          let salaryRulesList = await SalaryRuleModel.find({ __v: 0 });

          ///Rules Applied
          let calculateAddedAmount = 0;
          let calculateDeductedAmount = 0;
          let basicPay = foundEmployee!.salary;
          let ruleAmountTobeAddedArray: any = [];
          let ruleAmountTobeDeductedArray: any = [];
          let total_employee = await employeeModel.find({}).countDocuments({});
          salaryRulesList.forEach((rule) => {
            let rule_is_applicable: (string | boolean)[] = [];
            let condition_list_to_be_checked = JSON.parse(
              JSON.stringify(rule.condition_array)
            );
            let valueToCheck = 0;
            if (rule.depends_upon === "salary")
              valueToCheck = foundEmployee!.salary!;
            if (rule.depends_upon === "employee_count")
              valueToCheck = total_employee;
            condition_list_to_be_checked.forEach((cObj: any) => {
              if (cObj.condition_name === "less_than") {
                if (valueToCheck < cObj.condition_value) {
                  rule_is_applicable.push(true);
                  if (cObj.operand) rule_is_applicable.push(cObj.operand);
                } else {
                  rule_is_applicable.push(false);
                  if (cObj.operand) rule_is_applicable.push(cObj.operand);
                }
              }
              if (cObj.condition_name === "equal_to") {
                if (valueToCheck == cObj.condition_value) {
                  rule_is_applicable.push(true);
                  if (cObj.operand) rule_is_applicable.push(cObj.operand);
                } else {
                  rule_is_applicable.push(false);
                  if (cObj.operand) rule_is_applicable.push(cObj.operand);
                }
              }
              if (cObj.condition_name === "greater_than_equal_to") {
                if (valueToCheck >= cObj.condition_value) {
                  rule_is_applicable.push(true);
                  if (cObj.operand) rule_is_applicable.push(cObj.operand);
                } else {
                  rule_is_applicable.push(false);
                  if (cObj.operand) rule_is_applicable.push(cObj.operand);
                }
              }
              if (cObj.condition_name === "greater_than") {
                if (valueToCheck > cObj.condition_value) {
                  rule_is_applicable.push(true);
                  if (cObj.operand) rule_is_applicable.push(cObj.operand);
                } else {
                  rule_is_applicable.push(false);
                  if (cObj.operand) rule_is_applicable.push(cObj.operand);
                }
              }

              if (cObj.condition_name == "not_equal_to") {
                if (foundEmployee!.salary !== cObj.condition_value) {
                  rule_is_applicable.push(true);
                  if (cObj.operand) rule_is_applicable.push(cObj.operand);
                } else {
                  rule_is_applicable.push(false);
                  if (cObj.operand) rule_is_applicable.push(cObj.operand);
                }
              }

              if (cObj.condition_name == "less_than_equal_to") {
                if (valueToCheck <= cObj.condition_value) {
                  rule_is_applicable.push(true);
                  if (cObj.operand) rule_is_applicable.push(cObj.operand);
                } else {
                  rule_is_applicable.push(false);
                  if (cObj.operand) rule_is_applicable.push(cObj.operand);
                }
              }
            });
            let finalRulesApplicableResult: any;
            rule_is_applicable.forEach((x, i) => {
              if (typeof x == "string" && x === "&&") {
                let el: string | boolean =
                  finalRulesApplicableResult && rule_is_applicable[i + 1];
                finalRulesApplicableResult = el;
              } else if (typeof x == "string" && x === "||") {
                let el: string | boolean =
                  finalRulesApplicableResult || rule_is_applicable[i + 1];

                finalRulesApplicableResult = el;
              } else {
                finalRulesApplicableResult = x;
              }
            });
            if (finalRulesApplicableResult == true) {
              if (rule.is_added === true) {
                let value = (rule.value * basicPay) / 100;
                let objAdd = {
                  name: rule.rule_name,
                  amount: value,
                };
                ruleAmountTobeAddedArray.push(objAdd);
                calculateAddedAmount = calculateAddedAmount + value;
              }

              if (rule.is_added === false) {
                let value = (rule.value * basicPay) / 100;
                let objDeduct = {
                  name: rule.rule_name,
                  amount: value,
                };
                ruleAmountTobeDeductedArray.push(objDeduct);
                calculateDeductedAmount = calculateDeductedAmount + value;
              }
            }
          });

          let employeeSalaryAfterAllRules =
            foundEmployee!.salary +
            calculateAddedAmount -
            calculateDeductedAmount;
          -totalLeaveAmountToBeDeduct;
          if (operandsCheckFlag)
            return {
              data: {
                message: "Provide value for perform condition",
                error: "On Fetch Error",
              },
              status_code: HttpStatus.BAD_REQUEST,
            };
          let totalUnpaidLeaveCount = 0;
          leaveResult.forEach((x) => {
            totalUnpaidLeaveCount += x.count;
          });
          return {
            status_code: HttpStatus.OK,
            data: {
              SalaryOfThisMonth: employeeSalaryAfterAllRules,
              TotalLeaveAmountToBeDeduct: totalLeaveAmountToBeDeduct,
              ruleAmountTobeAdded: calculateAddedAmount,
              ruleAmountTobeDeducted: calculateDeductedAmount,
              LeaveHistoryThisMonth: {
                TotalLeave: totalLeavesCount, // totalUnpaidLeaveCount,
                TotalPaidLeaves: totalLeavesCount - totalUnpaidLeaveCount,
                TotalUnpaidLeaves: totalUnpaidLeaveCount,
                TotalWorkingDays: totalWorkingDays,
                TotalPaidDays: totalWorkingDays - totalLeaveAmountDeductedDays,
                History: leaveResult,
              },
              TotalRulesAmountHistory: {
                AmountTobeAdded: ruleAmountTobeAddedArray,
                AmountTobeDeducted: ruleAmountTobeDeductedArray,
              },
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
          Error: "On Fetch Error",
        },
      };
    }
  };
  imageOpacity = async (path: string): Promise<IServiceResult> => {
    let new_path;
    const image = await Jimp.read(path).then((result: any) => {
      result.opacity(0.3).write("D:\\opacityImage");
      new_path = "D:\\opacityImage";
      return new_path;
    });

    return {
      data: new_path,
      status_code: HttpStatus.OK,
    };
  };

  MonthlyAllEmployeeSalarySlip = async (
    req: Request,
    model: GenerateAllEmployeeSalarySlipViewmodel
  ): Promise<IServiceResult> => {
    try {
      let userDetails = <DocumentType<Employees>>req.user;
      let findRequestUserRoles = await roles.find({
        _id: { $in: userDetails.roles },
      });
      let findRequestUserRolesDetails = findRequestUserRoles.map((role) => {
        return role.name;
      });

      if (!findRequestUserRolesDetails.includes(EnumRoles.MASTERADMIN))
        return {
          data: {
            message:
              "You Are Not Authorized For Generate All Employee Salary Slip",
            error: "On Update Error",
          },
          status_code: HttpStatus.UNAUTHORIZED,
        };
      else {
        let current_date = new Date();
        let req_month = model.month ? model.month : current_date.getMonth() + 1;
        let req_year = model.year ?? current_date.getFullYear();

        //if (req_month == 0) req_month = 11;

        ////////////////*****************All Employee Salary Slip */
        //Get All Employee List

        let allEmployeeList = await this.allEmployeeList(req);
        let result;
        if (allEmployeeList.data.message) return allEmployeeList.data;
        else {
          result = await Promise.all(
            allEmployeeList.data.map(async (emp: any) => {
              let obj = {
                employee_id: emp._id.toString(),
                month: req_month,
                year: req_year,
              };
              let salary_slip_result = await this.generateEmployeeSalarySlip(
                req,
                obj
              );

              let salary_slip_path = salary_slip_result.data;
              let final_obj = {
                employee_id: emp._id.toString(),
                emp_email: emp.email,
                path: salary_slip_path,
                organization_id: emp.organization_id,
              };
              return final_obj;
            })
          );
        }

        return {
          data: result,
          status_code: HttpStatus.OK,
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
  createSalarySlipPDf = async (obj: any): Promise<IServiceResult> => {
    try {
      let foundEmployee = obj;

      const PDFDocument = require("pdfkit");

      var doc = new PDFDocument({
        size: "A4",
        margins: {
          top: 10,
          bottom: 10,
          left: 10,
          right: 10,
        },
      });
      let pdfFileName = v4();
      doc.fontSize(10);
      var writeStream = fs.createWriteStream(
        `D:\\officeproject\\public\\salarySlip\\${pdfFileName}.pdf`
      );
      doc.pipe(writeStream);

      let secondDividerPoint = doc.page.width / 2;
      let firstDividerPoint = secondDividerPoint / 2;
      let thirdDividerPoint = firstDividerPoint + secondDividerPoint;

      let leftStart = (doc.page.margins.left ?? doc.page.margins) + 1;
      let rightEnd =
        doc.page.width - (doc.page.margins.right ?? doc.page.margins);

      ///
      //let startDocY = doc.y + 30;
      // let x1 = doc.x;
      // let x4 = 180; //firstDividerPoint && 320---secondDividerPoint
      // let x6 = 180; //firstDividerPoint+1
      // let x7 = 450; //thirdDividerPoint

      /***************************** */

      let name = v4();
      let tempFilePath = "D:\\officeproject\\public\\logo";
      let imagename = name + ".png";
      let image_path = "D:\\officeproject\\public\\logo\\" + imagename;
      console.log(image_path, "pp");
      //

      await uploadService.downloadFile(
        foundEmployee.orgaization_logo,
        tempFilePath,
        imagename
      );

      doc
        .image(
          image_path,
          leftStart,
          doc.y,

          { fit: [100, 100] }
        )
        .moveDown(1.0);
      // // remove copy of logo from local storage created while getting download path
      //  remove(path);
      let startDocY = doc.y;

      let waterMarkEndY = 0;
      doc
        .font("Helvetica-BoldOblique")
        .rect(leftStart, doc.y, rightEnd - 10, 0)
        .moveTo(firstDividerPoint, doc.y)
        .moveDown(0.2)
        .text(foundEmployee.orgaization_name, secondDividerPoint - 40, doc.y, {
          indent: 2,
          align: "left",
        })

        .moveDown(0.2)
        .rect(leftStart, doc.y, rightEnd - 10, 0)
        .moveTo(firstDividerPoint, doc.y)
        .moveDown(0.2)
        .text(
          foundEmployee.orgaization_address,
          secondDividerPoint - 40,
          doc.y,
          {
            indent: 2,
            align: "left",
          }
        )
        .moveDown(0.1)
        .rect(leftStart, doc.y, rightEnd - 10, 0)
        .moveTo(firstDividerPoint, doc.y)
        .moveDown(0.2)
        .text(foundEmployee.MonthDetails, secondDividerPoint - 40, doc.y, {
          indent: 2,
          align: "left",
        })
        .moveDown(0.2)
        .font("Helvetica")
        .rect(leftStart, doc.y, rightEnd - 10, 0)
        .moveTo(firstDividerPoint, doc.y)
        .lineTo(firstDividerPoint, doc.y + 72)
        .moveDown(0.2)
        .text("Employee Name ", leftStart, doc.y, {
          indent: 2,
          align: "left",
        })

        .moveUp()
        .text(foundEmployee.fullname, firstDividerPoint + 1, doc.y, {
          indent: 2,
        })

        .moveTo(secondDividerPoint, doc.y - 14)
        .lineTo(secondDividerPoint, doc.y + 57) //2nd  partition line
        .moveDown(0.2)
        .text("UAN", secondDividerPoint, doc.y - 14, {
          indent: 2,
          align: "left",
        })

        .moveUp()
        .text(foundEmployee.UAN, thirdDividerPoint, doc.y, {
          indent: 2,
        })
        .moveTo(thirdDividerPoint, doc.y - 14)
        .lineTo(thirdDividerPoint, doc.y + 57) //third partition line
        .moveDown(0.2);

      doc

        .text("Employee ID", leftStart, doc.y, {
          indent: 2,
        })

        .moveUp()
        .text(foundEmployee.EmpId, firstDividerPoint + 1, doc.y, {
          indent: 2,
        })
        .rect(leftStart, doc.y - 14, rightEnd - 10, 0)
        .moveTo(secondDividerPoint, doc.y - 14)
        .moveDown(0.3)
        .text("PF No. ", secondDividerPoint, doc.y - 14, {
          indent: 2,
          align: "left",
        })

        .moveUp()
        .text(foundEmployee.PFNO, thirdDividerPoint, doc.y, {
          indent: 2,
        })

        .rect(leftStart, doc.y, rightEnd - 10, 0)
        .moveTo(firstDividerPoint, doc.y)
        .moveDown(0.2)
        .text("Designation", leftStart, doc.y, {
          indent: 2,
          align: "left",
        })

        .moveUp()
        .text(foundEmployee.Designation, firstDividerPoint + 1, doc.y, {
          indent: 2,
        })

        .moveTo(secondDividerPoint, doc.y - 14)
        .moveDown(0.2)
        .text("ESI No. ", secondDividerPoint, doc.y - 14, {
          indent: 2,
          align: "left",
        })
        .moveUp()
        .text(foundEmployee.EsiNo, thirdDividerPoint, doc.y, {
          indent: 2,
        })

        .rect(leftStart, doc.y, rightEnd - 10, 0)
        .moveTo(firstDividerPoint, doc.y)
        .moveDown(0.2)
        .text("Department", leftStart, doc.y, {
          indent: 2,
          align: "left",
        })
        .moveUp()
        .text(foundEmployee.Department, firstDividerPoint + 1, doc.y, {
          indent: 2,
        })
        .moveTo(secondDividerPoint, doc.y - 14)
        .moveDown(0.2)
        .text("Bank Name", secondDividerPoint, doc.y - 14, {
          indent: 2,
          align: "left",
        })
        .moveUp()
        .text(foundEmployee.BankName, thirdDividerPoint, doc.y, {
          indent: 2,
        });

      doc
        .rect(leftStart, doc.y, rightEnd - 10, 0)
        .moveTo(firstDividerPoint, doc.y)
        .moveDown(0.2)
        .text("DOJ", leftStart, doc.y, {
          indent: 2,
          align: "left",
        })
        .moveUp()
        .text(foundEmployee.Doj, firstDividerPoint + 1, doc.y, {
          indent: 2,
        })

        .moveTo(secondDividerPoint, doc.y - 14)
        .moveDown(0.2)
        .text("Bank Acc No", secondDividerPoint, doc.y - 14, {
          indent: 2,
          align: "left",
        })
        .moveUp()
        .text(foundEmployee.BankAccNo, thirdDividerPoint, doc.y, {
          indent: 2,
        })
        .moveUp();
      //add empty row
      doc
        .rect(leftStart, doc.y + 14, rightEnd - 10, 0)
        .moveDown(0.2)
        .text(" ", leftStart, doc.y, {
          indent: 2,
          align: "left",
        })
        .moveUp()
        .text(" ", firstDividerPoint + 1, doc.y, {
          indent: 2,
        });
      doc
        .rect(leftStart, doc.y + 14, rightEnd - 10, 0)
        .moveDown(0.2)
        .text(" ", secondDividerPoint, doc.y - 14, {
          indent: 2,
          align: "left",
        })
        .moveUp()
        .text(" ", thirdDividerPoint, doc.y, {
          indent: 2,
        })

        /************ First Section Complete *******/

        ////////////2nd part///////////////
        .moveDown(1.5);

      doc
        .rect(leftStart, doc.y + 25, rightEnd - 10, 0)
        .moveTo(firstDividerPoint, doc.y - 2)
        .lineTo(firstDividerPoint, doc.y + 25)
        .text("Total Working Days", leftStart, doc.y, {
          indent: 2,
          align: "left",
        })
        .moveUp()
        .text(foundEmployee.totalWorkingdays, firstDividerPoint + 1, doc.y, {
          indent: 2,
        })
        .moveTo(secondDividerPoint, doc.y - 14)
        .lineTo(secondDividerPoint, doc.y + 13)
        .moveDown(0.2)
        .text("Paid Leaves", secondDividerPoint, doc.y - 14, {
          indent: 2,
          align: "left",
        })
        .moveUp()
        .text(foundEmployee.TotalPaidLeaves, thirdDividerPoint, doc.y, {
          indent: 2,
        });
      doc
        .rect(leftStart, doc.y - 14, rightEnd - 10, 0)
        .moveTo(thirdDividerPoint, doc.y - 14)
        .lineTo(thirdDividerPoint, doc.y + 13) // 2nd part third partition line
        .moveTo(firstDividerPoint, doc.y)
        .moveDown(0.2)
        .text("Unpaid Leaves", leftStart, doc.y, {
          indent: 2,
          align: "left",
        })
        .moveUp()
        .text(foundEmployee.TotalUnpaidLeaves, firstDividerPoint + 1, doc.y, {
          indent: 2,
        });
      //.moveDown(0.1);
      doc
        .rect(leftStart, doc.y - 14, rightEnd - 10, 0)
        .moveTo(secondDividerPoint, doc.y - 14)
        .moveDown(0.2)
        .text("Leaves Taken", secondDividerPoint, doc.y - 14, {
          indent: 2,
          align: "left",
        })
        .moveUp()
        .text(foundEmployee.leavetaken, thirdDividerPoint, doc.y, {
          indent: 2,
        })
        .moveDown(0.2)
        /////////////////3rd part/////////////
        .moveDown(1);

      doc.font("Helvetica-Bold");
      doc
        .rect(leftStart, doc.y - 14, rightEnd - 10, 0)

        .moveTo(firstDividerPoint, doc.y)

        .text("Earnings", 100, doc.y, {
          indent: 2,
          align: "left",
        });

      doc
        .rect(leftStart, doc.y - 14, rightEnd - 10, 0)
        .moveTo(secondDividerPoint, doc.y - 14)
        .lineTo(secondDividerPoint, doc.y + 15)
        .moveDown(0.2)
        .text("Deductions ", 400, doc.y - 14, {
          indent: 2,
          align: "left",
        });

      doc
        .rect(leftStart, doc.y, rightEnd - 10, 0) // earning && deduction below  rectangle boundary
        .moveTo(thirdDividerPoint, doc.y)
        .lineTo(thirdDividerPoint, doc.y + 15); //3rd part third partition line

      doc
        .font("Helvetica")
        .rect(leftStart, doc.y + 14, rightEnd - 10, 0)
        .moveTo(firstDividerPoint, doc.y)
        .lineTo(firstDividerPoint, doc.y + 15)
        .moveDown(0.2)
        .text("Basic Salary", leftStart, doc.y, {
          indent: 2,
          align: "left",
        })

        .moveUp()
        .text(foundEmployee.salary, firstDividerPoint + 1, doc.y, {
          indent: 2,
        })
        .moveDown(0);

      //salaryDetails
      let ruleAddedAmountArray = JSON.parse(
        JSON.stringify(
          obj.salaryDetails.data["TotalRulesAmountHistory"].AmountTobeAdded
        )
      );
      let ruleDeductedAmountArray = JSON.parse(
        JSON.stringify(
          obj.salaryDetails.data["TotalRulesAmountHistory"].AmountTobeDeducted
        )
      );
      let all_added_rules: any = [];
      let all_deducted_rules: any = [];
      obj.foundRuleList.forEach((x: any) => {
        if (x.is_added === true) all_added_rules.push(x);
        else all_deducted_rules.push(x);
      });
      let totalLength = 0;
      if (all_added_rules.length > all_deducted_rules.length)
        totalLength = all_added_rules.length;
      else totalLength = all_deducted_rules.length;
      let totalEarnings = 0;
      let totalDeductions = 0;
      let allAppliedRules = [
        ...ruleAddedAmountArray,
        ...ruleDeductedAmountArray,
      ];
      waterMarkEndY = totalLength * 14 + doc.y + 14;
      //watermark add

      let imagePath = await this.imageOpacity(image_path);
      console.log(imagePath.data
        );
      
      await doc.image(
        image_path,
        //imagePath.data,
        firstDividerPoint,
        (startDocY + waterMarkEndY) / 2,
        {
          width: thirdDividerPoint - firstDividerPoint,
          height: 52,
        }
      );
      // remove copy of logo from local storage created while getting download path
      remove(image_path);
      for (let i = 0; i < totalLength; i++) {
        doc
          .rect(leftStart, doc.y + 14, rightEnd - 10, 0)
          .moveTo(firstDividerPoint, doc.y + 1)
          .lineTo(firstDividerPoint, doc.y + 15)
          .moveTo(secondDividerPoint, doc.y - 14)
          .lineTo(secondDividerPoint, doc.y + 15)
          .moveTo(thirdDividerPoint, doc.y)
          .lineTo(thirdDividerPoint, doc.y + 15)
          .moveDown(0.2);
        if (i < all_added_rules.length) {
          let amountValue = 0;
          allAppliedRules.forEach((x) => {
            if (x.name == all_deducted_rules[i].rule_name)
              amountValue = x.amount;
          });
          doc.text(
            all_deducted_rules[i].rule_name,
            secondDividerPoint,
            doc.y - 14,
            {
              indent: 2,
              align: "left",
            }
          );

          doc
            .moveUp()
            .text(amountValue, thirdDividerPoint, doc.y, {
              indent: 2,
            })
            .moveDown(0.2);
          totalDeductions += amountValue;
        }
        if (i < all_deducted_rules.length) {
          let amountValueToBeAdd = 0;
          allAppliedRules.forEach((x) => {
            if (x.name == all_added_rules[i]?.rule_name)
              amountValueToBeAdd = x.amount;
          });
          doc
            .text(all_added_rules[i]?.rule_name, leftStart, doc.y, {
              indent: 2,
              align: "left",
            })

            .moveUp()
            .text(amountValueToBeAdd, firstDividerPoint + 1, doc.y, {
              indent: 2,
            });
          totalEarnings += amountValueToBeAdd;
        }
      }
      //Add empty Row
      doc
        .rect(leftStart, doc.y + 14, rightEnd - 10, 0)
        .moveDown(0.2)
        .text(" ", leftStart, doc.y, {
          indent: 2,
          align: "left",
        })
        .moveUp()
        .text(" ", firstDividerPoint + 1, doc.y, {
          indent: 2,
        });
      doc
        .rect(leftStart, doc.y + 14, rightEnd - 10, 0)
        .moveDown(0.2)
        .text(" ", secondDividerPoint, doc.y - 14, {
          indent: 2,
          align: "left",
        })
        .moveUp()
        .text(" ", thirdDividerPoint, doc.y, {
          indent: 2,
        });
      ///
      doc

        .rect(leftStart, doc.y + 14, rightEnd - 10, 0)
        .moveTo(firstDividerPoint, doc.y)
        .lineTo(firstDividerPoint, doc.y + 15)
        .moveTo(thirdDividerPoint, doc.y + 1)
        .lineTo(thirdDividerPoint, doc.y + 14)
        .moveDown(0.2)
        .text("Total Earnings", leftStart, doc.y, {
          indent: 2,
          align: "left",
        })

        .moveUp()
        .text(
          totalEarnings + foundEmployee.salary,
          firstDividerPoint + 1,
          doc.y,
          {
            indent: 2,
          }
        );

      doc
        .rect(leftStart, doc.y + 14, rightEnd - 10, 0)
        .moveTo(secondDividerPoint, doc.y - 14)
        .lineTo(secondDividerPoint, doc.y)
        .moveTo(thirdDividerPoint, doc.y + 1)
        .lineTo(thirdDividerPoint, doc.y)
        .moveDown(0.2)
        .text("Total Deductions", secondDividerPoint, doc.y - 14, {
          indent: 2,
          align: "left",
        })
        .moveUp()
        .text(totalDeductions, thirdDividerPoint, doc.y, {
          indent: 2,
        });

      //Add empty Row
      doc

        .rect(leftStart, doc.y + 14, rightEnd - 10, 0)

        .moveDown(0.1)
        .text(" ", leftStart, doc.y, {
          indent: 2,
          align: "left",
        })

        .moveUp()
        .text(" ", firstDividerPoint + 1, doc.y, {
          indent: 2,
        });

      doc
        .rect(leftStart, doc.y + 14, rightEnd - 10, 0)

        .moveDown(0.2)

        .text(" ", secondDividerPoint, doc.y - 14, {
          indent: 2,
          align: "left",
        })

        .moveUp()
        .text(" ", thirdDividerPoint, doc.y, {
          indent: 2,
        });

      //
      doc.moveDown(0.1);
      doc
        .rect(leftStart, doc.y + 14, rightEnd - 10, 0)

        .moveTo(secondDividerPoint, doc.y - 14)
        .moveDown(0.2)
        .font("Helvetica-BoldOblique")

        .text("Net Salary", 150, doc.y, {
          indent: 2,
          align: "left",
        })

        .moveUp()
        .text(
          totalEarnings + foundEmployee.salary - totalDeductions + "/-",
          thirdDividerPoint,
          doc.y,
          {
            indent: 2,
          }
        )
        .moveTo(leftStart, startDocY)
        .lineTo(leftStart, doc.y)

        .moveTo(rightEnd, startDocY)
        .lineTo(rightEnd, doc.y);
      waterMarkEndY = doc.y;
      doc.stroke().moveDown(0.2);

      doc.end();
      return {
        data: writeStream.path,
        status_code: HttpStatus.OK,
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
  //Salary Rules
  addSalaryRule = async (
    req: Request,
    model: AddSalaryRuleViewmodel
  ): Promise<IServiceResult> => {
    try {
      let userDetails = <DocumentType<Employees>>req.user;
      let findRequestUserRoles = await roles.find({
        _id: { $in: userDetails.roles },
      });
      let findRequestUserRolesDetails = findRequestUserRoles.map((role) => {
        return role.name;
      });

      if (!findRequestUserRolesDetails.includes(EnumRoles.MASTERADMIN))
        return {
          data: {
            message: "You Are Not Authorized For Add Salary Rules",
            error: "On Add Error",
          },
          status_code: HttpStatus.UNAUTHORIZED,
        };
      else {
        let checkSalaryRulesExistence = await SalaryRuleModel.findOne({
          rule_name: model.rule_name,
        });

        let conditionArrayLength = model.condition_array.length;
        if (model.condition_array[conditionArrayLength - 1].operand)
          return {
            data: {
              message: "Provide valid Inputs for check conditions",
              error: "On Add Error",
            },
            status_code: HttpStatus.BAD_REQUEST,
          };
        if (!checkSalaryRulesExistence) {
          let modelToSave = <DocumentType<SalaryRules>>model;

          let addSalaryRulesResult = await SalaryRuleModel.create(modelToSave);

          if (addSalaryRulesResult)
            return {
              status_code: HttpStatus.OK,
              data: addSalaryRulesResult,
            };
          else
            return {
              status_code: HttpStatus.BAD_REQUEST,
              data: {
                message: " An Error Occurred While Adding Salary Rules",
                Error: "On Add Error",
              },
            };
        } else
          return {
            status_code: HttpStatus.BAD_REQUEST,
            data: {
              message: "Salary Rule Already Existed With This Name",
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
  deleteSalaryRule = async (req: Request): Promise<IServiceResult> => {
    try {
      let userDetails = <DocumentType<Employees>>req.user;
      let findRequestUserRoles = await roles.find({
        _id: { $in: userDetails.roles },
      });
      let findRequestUserRolesDetails = findRequestUserRoles.map((role) => {
        return role.name;
      });

      if (!findRequestUserRolesDetails.includes(EnumRoles.MASTERADMIN))
        return {
          data: {
            message: "You Are Not Authorized For Delete Salary Rules",
            error: "On Delete Error",
          },
          status_code: HttpStatus.UNAUTHORIZED,
        };
      else {
        let deleteSalaryRule = await SalaryRuleModel.deleteOne({
          _id: new mongoose.Types.ObjectId(req.params._id),
        });

        if (deleteSalaryRule && deleteSalaryRule.deletedCount > 0)
          return {
            status_code: HttpStatus.OK,
            data: true,
          };
        else
          return {
            status_code: HttpStatus.BAD_REQUEST,
            data: {
              message: " An Error Occurred While Deleting Salary Rules",
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
  updateSalaryRule = async (
    req: Request,
    model: UpdateSalaryRuleViewmodel
  ): Promise<IServiceResult> => {
    try {
      let userDetails = <DocumentType<Employees>>req.user;
      let findRequestUserRoles = await roles.find({
        _id: { $in: userDetails.roles },
      });
      let findRequestUserRolesDetails = findRequestUserRoles.map((role) => {
        return role.name;
      });

      if (!findRequestUserRolesDetails.includes(EnumRoles.MASTERADMIN))
        return {
          data: {
            message: "You Are Not Authorized For Update Salary Rules",
            error: "On Update Error",
          },
          status_code: HttpStatus.UNAUTHORIZED,
        };
      else {
        let foundSalaryRule = await SalaryRuleModel.findById(model._id);
        if (foundSalaryRule) {
          if (model.condition_array) {
            let conditionArrayLength = model.condition_array.length;
            if (model.condition_array[conditionArrayLength - 1].operand)
              return {
                data: {
                  message: "Provide valid Inputs for check conditions",
                  error: "On Update Error",
                },
                status_code: HttpStatus.BAD_REQUEST,
              };
          }
          let checkSalaryRuleExistence = await SalaryRuleModel.findOne({
            rule_name: model.rule_name,
          });
          let modelToSave = <DocumentType<SalaryRules>>model;
          modelToSave.rule_name = model.rule_name ?? foundSalaryRule.rule_name;
          modelToSave.depends_upon =
            model.depends_upon ?? foundSalaryRule.depends_upon;
          modelToSave.is_added = model.is_added ?? foundSalaryRule.is_added;

          modelToSave.value = model.value ?? foundSalaryRule.value;

          modelToSave.condition_array = model.condition_array
            ? model.condition_array
            : foundSalaryRule.condition_array;

          if (!checkSalaryRuleExistence) {
            let updateSalaryRule = await SalaryRuleModel.updateOne(
              { _id: new mongoose.Types.ObjectId(model._id) },
              modelToSave
            );

            if (updateSalaryRule && updateSalaryRule.modifiedCount > 0)
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
            if (checkSalaryRuleExistence._id.toString() == model._id) {
              let updateSalaryRule = await SalaryRuleModel.updateOne(
                { _id: new mongoose.Types.ObjectId(model._id) },
                modelToSave
              );

              return { data: true, status_code: HttpStatus.OK };
            } else
              return {
                status_code: HttpStatus.BAD_REQUEST,
                data: {
                  message: "Salary Rule Already Existed With This Name",
                  Error: "On Update Error",
                },
              };
          }
        } else
          return {
            status_code: HttpStatus.BAD_REQUEST,
            data: {
              message: "Salary Rules Not Found",
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
  allSalaryRuleList = async (req: Request): Promise<IServiceResult> => {
    try {
      let salaryRuleList = await SalaryRuleModel.find({});
      if (salaryRuleList && salaryRuleList.length > 0)
        return {
          status_code: HttpStatus.OK,

          data: salaryRuleList,
        };
      else
        return {
          status_code: HttpStatus.BAD_REQUEST,
          data: {
            message: "Salary Rules List Not Found",
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
  // calculateEmployeeSalary = async (
  //   req: Request,
  //   model: CalculateEmployeeSalaryViewmodel
  // ): Promise<IServiceResult> => {
  //   try {
  //     let userDetails = <DocumentType<Employees>>req.user;
  //     let findRequestUserRoles = await roles.find({
  //       _id: { $in: userDetails.roles },
  //     });
  //     let findRequestUserRolesDetails = findRequestUserRoles.map((role) => {
  //       return role.name;
  //     });

  //     if (!findRequestUserRolesDetails.includes(EnumRoles.MASTERADMIN))
  //       return {
  //         data: {
  //           message: "You Are Not Authorized For Calculate Employee Salary",
  //           error: "On Update Error",
  //         },
  //         status_code: HttpStatus.UNAUTHORIZED,
  //       };
  //     else {
  //       let operandsCheckFlag = false;
  //       let foundEmployee = await employeeModel.findById(model.employee_id);

  //       if (!foundEmployee)
  //         return {
  //           data: { message: "Employee Not Found", error: "On Fetch Error" },
  //           status_code: HttpStatus.BAD_REQUEST,
  //         };
  //       else {
  //         let salaryRulesList = await SalaryRuleModel.find({ __v: 0 });

  //         ///Rules Applied
  //         let calculateAddedAmount = 0;
  //         let calculateDeductedAmount = 0;
  //         let basicPay = foundEmployee!.salary;
  //         let ruleAmountTobeAddedArray: any = [];
  //         let ruleAmountTobeDeductedArray: any = [];
  //         let total_employee = await employeeModel.find({}).countDocuments({});
  //         salaryRulesList.forEach((rule) => {
  //           let rule_is_applicable: (string | boolean)[] = [];
  //           let condition_list_to_be_checked = JSON.parse(
  //             JSON.stringify(rule.condition_array)
  //           );
  //           let valueToCheck = 0;
  //           if (rule.depends_upon === "salary")
  //             valueToCheck = foundEmployee!.salary!;
  //           if (rule.depends_upon === "employee_count")
  //             valueToCheck = total_employee;
  //           condition_list_to_be_checked.forEach((cObj: any) => {
  //             if (cObj.condition_name === "less_than") {
  //               if (valueToCheck < cObj.condition_value) {
  //                 rule_is_applicable.push(true);
  //                 if (cObj.operand) rule_is_applicable.push(cObj.operand);
  //               } else {
  //                 rule_is_applicable.push(false);
  //                 if (cObj.operand) rule_is_applicable.push(cObj.operand);
  //               }
  //             }
  //             if (cObj.condition_name === "equal_to") {
  //               if (valueToCheck == cObj.condition_value) {
  //                 rule_is_applicable.push(true);
  //                 if (cObj.operand) rule_is_applicable.push(cObj.operand);
  //               } else {
  //                 rule_is_applicable.push(false);
  //                 if (cObj.operand) rule_is_applicable.push(cObj.operand);
  //               }
  //             }
  //             if (cObj.condition_name === "greater_than_equal_to") {
  //               if (valueToCheck >= cObj.condition_value) {
  //                 rule_is_applicable.push(true);
  //                 if (cObj.operand) rule_is_applicable.push(cObj.operand);
  //               } else {
  //                 rule_is_applicable.push(false);
  //                 if (cObj.operand) rule_is_applicable.push(cObj.operand);
  //               }
  //             }
  //             if (cObj.condition_name === "greater_than") {
  //               if (valueToCheck > cObj.condition_value) {
  //                 rule_is_applicable.push(true);
  //                 if (cObj.operand) rule_is_applicable.push(cObj.operand);
  //               } else {
  //                 rule_is_applicable.push(false);
  //                 if (cObj.operand) rule_is_applicable.push(cObj.operand);
  //               }
  //             }

  //             if (cObj.condition_name == "not_equal_to") {
  //               if (foundEmployee!.salary !== cObj.condition_value) {
  //                 rule_is_applicable.push(true);
  //                 if (cObj.operand) rule_is_applicable.push(cObj.operand);
  //               } else {
  //                 rule_is_applicable.push(false);
  //                 if (cObj.operand) rule_is_applicable.push(cObj.operand);
  //               }
  //             }

  //             if (cObj.condition_name == "less_than_equal_to") {
  //               if (valueToCheck <= cObj.condition_value) {
  //                 rule_is_applicable.push(true);
  //                 if (cObj.operand) rule_is_applicable.push(cObj.operand);
  //               } else {
  //                 rule_is_applicable.push(false);
  //                 if (cObj.operand) rule_is_applicable.push(cObj.operand);
  //               }
  //             }
  //           });
  //           let finalRulesApplicableResult: any;
  //           rule_is_applicable.forEach((x, i) => {
  //             if (typeof x == "string" && x === "&&") {
  //               let el: string | boolean =
  //                 finalRulesApplicableResult && rule_is_applicable[i + 1];
  //               finalRulesApplicableResult = el;
  //             } else if (typeof x == "string" && x === "||") {
  //               let el: string | boolean =
  //                 finalRulesApplicableResult || rule_is_applicable[i + 1];

  //               finalRulesApplicableResult = el;
  //             } else {
  //               finalRulesApplicableResult = x;
  //             }
  //           });
  //           if (finalRulesApplicableResult == true) {
  //             if (rule.is_added === true) {
  //               let value = (rule.value * basicPay) / 100;
  //               let objAdd = {
  //                 name: rule.rule_name,
  //                 amount: value,
  //               };
  //               ruleAmountTobeAddedArray.push(objAdd);
  //               calculateAddedAmount = calculateAddedAmount + value;
  //             }

  //             if (rule.is_added === false) {
  //               let value = (rule.value * basicPay) / 100;
  //               let objDeduct = {
  //                 name: rule.rule_name,
  //                 amount: value,
  //               };
  //               ruleAmountTobeDeductedArray.push(objDeduct);
  //               calculateDeductedAmount = calculateDeductedAmount + value;
  //             }
  //           }
  //         });

  //         let employeeSalaryAfterAllRules =
  //           foundEmployee!.salary +
  //           calculateAddedAmount -
  //           calculateDeductedAmount;

  //         if (operandsCheckFlag)
  //           return {
  //             data: {
  //               message: "Provide value for perform condition",
  //               error: "On Fetch Error",
  //             },
  //             status_code: HttpStatus.BAD_REQUEST,
  //           };

  //         return {
  //           status_code: HttpStatus.OK,
  //           data: {
  //             SalaryOfThisMonth: employeeSalaryAfterAllRules,

  //             ruleAmountTobeAdded: calculateAddedAmount,
  //             ruleAmountTobeDeducted: calculateDeductedAmount,

  //             TotalRulesAmountHistory: {
  //               AmountTobeAdded: ruleAmountTobeAddedArray,
  //               AmountTobeDeducted: ruleAmountTobeDeductedArray,
  //             },
  //           },
  //         };
  //       }
  //     }
  //   } catch (error) {
  //     console.log(error);
  //     return {
  //       status_code: HttpStatus.INTERNAL_SERVER_ERROR,
  //       data: {
  //         message: "Internal Server Error",
  //         Error: "On Update Error",
  //       },
  //     };
  //   }
  // };
}
export default new EmployeeService();
