import { DocumentType } from "@typegoose/typegoose";
import { Request } from "express";
import HttpStatus from "http-status-codes";
import mongoose from "mongoose";
import { IServiceResult } from "../../../common/common-methods";
import { Employees } from "../../../models/employee-management-models/employee.model";
import organizationModel from "../../../models/employee-management-models/organization.model";
import roles from "../../../models/employee-management-models/roles.model";
import departmentModel, {
  Department
} from "../../../models/hr-management/department.model";
import {
  AddDepartmentViewmodel,
  GetAllDepartmentListViewmodel,
  UpdateDepartmentViewmodel
} from "../../../view-models/hr-management-viewmodels/department";

class DepartmentService {
  addDepartment = async (
    req: Request,
    model: AddDepartmentViewmodel
  ): Promise<IServiceResult> => {
    try {
      let userDetails = <DocumentType<Employees>>req.user;
      let findRequestUserRoles = await roles.find({
        _id: { $in: userDetails.roles },
      });
      let findRequestUserRolesDetails = findRequestUserRoles.map((role) => {
        return role.name;
      });

      if (!findRequestUserRolesDetails.some((e) => ["masteradmin"].includes(e)))
        return {
          data: {
            message:
              "You Are Not Authorized For Add Department In Organization",
            error: "On Add Error",
          },
          status_code: HttpStatus.UNAUTHORIZED,
        };
      else {
        let checkDepartmnetExistence = await departmentModel.findOne({
          name: model.name,
          organization_id: model.organization_id,
        });

        if (checkDepartmnetExistence)
          return {
            status_code: HttpStatus.BAD_REQUEST,
            data: {
              message:
                "Department Already Exist With This Name  In This Organization",
              Error: "On Add Error",
            },
          };
        else {
          let modelToSave = <DocumentType<Department>>model;

          let addDepartmentResult = await departmentModel.create(modelToSave);
          if (addDepartmentResult)
            return {
              status_code: HttpStatus.OK,
              data: addDepartmentResult,
            };
          else
            return {
              status_code: HttpStatus.BAD_REQUEST,
              data: {
                message: "An Error Occurred While Adding Department",
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
  updateDepartment = async (
    req: Request,
    model: UpdateDepartmentViewmodel
  ): Promise<IServiceResult> => {
    try {
      let userDetails = <DocumentType<Employees>>req.user;
      let findRequestUserRoles = await roles.find({
        _id: { $in: userDetails.roles },
      });
      let findRequestUserRolesDetails = findRequestUserRoles.map((role) => {
        return role.name;
      });

      if (!findRequestUserRolesDetails.some((e) => ["masteradmin"].includes(e)))
        return {
          data: {
            message: "You Are Not Authorized For Update Department",
            error: "On Update Error",
          },
          status_code: HttpStatus.UNAUTHORIZED,
        };
      else {
        let foundDepartment = await departmentModel.findById(model._id);
        if (foundDepartment) {
          let checkDepartmnetExistence = await departmentModel.findOne({
            name: model.name,
            organization_id: new mongoose.Types.ObjectId(
              foundDepartment.organization_id!.toString()
            ),
          });

          if (checkDepartmnetExistence) {
            if (checkDepartmnetExistence._id.toString() == model._id.toString())
              return {
                status_code: HttpStatus.OK,
                data: true,
              };
            else
              return {
                status_code: HttpStatus.BAD_REQUEST,
                data: {
                  message:
                    "Department Already Exist With This Name  In This Organization",
                  Error: "On Update Error",
                },
              };
          } else {
            let modelToSave: Department = <DocumentType<Department>>model;
            modelToSave.organization_id = foundDepartment.organization_id;
            let updatedDepartment = await departmentModel.updateOne(
              { _id: model._id },
              modelToSave
            );

            if (updatedDepartment && updatedDepartment.modifiedCount > 0)
              return {
                status_code: HttpStatus.OK,
                data: true,
              };
            else
              return {
                status_code: HttpStatus.BAD_REQUEST,
                data: {
                  message: "An Error Occurred While Updating Department",
                  Error: "On Update Error",
                },
              };
          }
        } else
          return {
            data: { message: "Department Not Found", error: "On Update Error" },
            status_code: HttpStatus.BAD_REQUEST,
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
  deleteDepartment = async (req: Request): Promise<IServiceResult> => {
    try {
      let userDetails = <DocumentType<Employees>>req.user;
      let findRequestUserRoles = await roles.find({
        _id: { $in: userDetails.roles },
      });
      let findRequestUserRolesDetails = findRequestUserRoles.map((role) => {
        return role.name;
      });

      if (!findRequestUserRolesDetails.some((e) => ["masteradmin"].includes(e)))
        return {
          data: {
            message:
              "You Are Not Authorized For Delete Department From Organization",
            error: "On Delete Error",
          },
          status_code: HttpStatus.UNAUTHORIZED,
        };
      else {
        let deleteDepartmentResult = await departmentModel.deleteOne({
          _id: req.params._id,
        });
        if (deleteDepartmentResult && deleteDepartmentResult.deletedCount > 0)
          return {
            status_code: HttpStatus.OK,
            data: true,
          };
        else
          return {
            status_code: HttpStatus.BAD_REQUEST,
            data: {
              message: "An Error Occurred While Deleting Department",
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
  listAllDepartment = async (
    req: Request,
    model: GetAllDepartmentListViewmodel
  ): Promise<IServiceResult> => {
    try {
      let foundOrganization = await organizationModel.findById(
        model.organization_id
      );

      if (foundOrganization) {
        let allroles = await roles.find({});
        let masterAdminId: string;
        allroles.forEach((role) => {
          if (role.name == "masteradmin") masterAdminId = role._id.toString();
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
          let departmentList = await departmentModel.find(
            {
              organization_id: model.organization_id,
            },
            { name: 1 }
          );

          if (departmentList && departmentList.length > 0)
            return {
              status_code: HttpStatus.OK,

              data: departmentList,
            };
          else
            return {
              status_code: HttpStatus.BAD_REQUEST,
              data: {
                message: "Department List Not Found For This Organization",
                Error: "On Fetch Error",
              },
            };
        } else {
          if (
            userDetails &&
            userDetails.organization_id!.toString() ==
              model.organization_id!.toString()
          ) {
            let departmentList = await departmentModel.find(
              {
                organization_id: model.organization_id,
              },
              { name: 1 }
            );
            if (departmentList && departmentList.length > 0)
              return {
                status_code: HttpStatus.OK,
                data: departmentList,
              };
            else
              return {
                status_code: HttpStatus.BAD_REQUEST,
                data: {
                  message: "Department List Not Found",
                  Error: "On Fetch Error",
                },
              };
          } else
            return {
              data: {
                message:
                  "You Are not Authorized To Get All Department List Of This Organization",
                error: "On Fetch Error",
              },
              status_code: HttpStatus.BAD_REQUEST,
            };
        }
      } else
        return {
          data: {
            message:"Organization Not Found",
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
  getDepartmentDetails = async (req: Request): Promise<IServiceResult> => {
    try {
      let userDetails = <DocumentType<Employees>>req.user;
      let findRequestUserRoles = await roles.find({
        _id: { $in: userDetails.roles },
      });
      let findRequestUserRolesDetails = findRequestUserRoles.map((role) => {
        return role.name;
      });
      if (!findRequestUserRolesDetails.some((e) => ["masteradmin"].includes(e)))
        return {
          data: {
            message: "You Are Not Authorized For Get Department Details",
            error: "On Fetch Error",
          },
          status_code: HttpStatus.UNAUTHORIZED,
        };
      else {
        let departmentDetails = await departmentModel.findOne({
          _id: req.params._id,
        });
        if (departmentDetails)
          return {
            status_code: HttpStatus.OK,
            data: departmentDetails,
          };
        else
          return {
            status_code: HttpStatus.BAD_REQUEST,
            data: {
              message: "Department Details Not Found",
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
export default new DepartmentService();
