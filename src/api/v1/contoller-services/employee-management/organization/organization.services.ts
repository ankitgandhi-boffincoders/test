import { DocumentType } from "@typegoose/typegoose";
import { Request } from "express";
import HttpStatus from "http-status-codes";
import { IServiceResult } from "../../../common/common-methods";
import { Employees } from "../../../models/employee-management-models/employee.model";
import organizationModel, {
  Organization
} from "../../../models/employee-management-models/organization.model";
import { default as roles } from "../../../models/employee-management-models/roles.model";
import {
  AddOrganizationViewmodel,
  UpdateOrganizationViewmodel
} from "../../../view-models/employee-management-viewmodels/organization";

class OrganizationService {
  addOrganization = async (
    req: Request,
    model: AddOrganizationViewmodel
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
        !findRequestUserRolesDetails.some((e) =>
          ["masteradmin", "superadmin"].includes(e)
        )
      )
        return {
          data: {
            message: "You Are Not Authorized For Add Organization",
            error: "On Add Error",
          },
          status_code: HttpStatus.UNAUTHORIZED,
        };

      let modelToSave = <DocumentType<Organization>>model;
      let foundOrganizationEmailExistence = await organizationModel.find({
        email: model.email.toLowerCase(),
      });
      if (
        foundOrganizationEmailExistence &&
        foundOrganizationEmailExistence.length > 0
      )
        return {
          data: {
            message: "Organization Already Exist With This Email",
            error: "On Add Error",
          },
          status_code: HttpStatus.BAD_REQUEST,
        };
      else {
        let phone_no_length = model.mobile_number.toString().length;
        if (phone_no_length > 10)
          return {
            data: {
              message: "mobile_number Can Not Be Gretaer Than 10 Digits",
              error: "On Add Error",
            },
            status_code: HttpStatus.BAD_REQUEST,
          };

        if (phone_no_length < 10)
          return {
            data: {
              message: "mobile_number Can Not Be Less Than 10 Digits",
              error: "On Add Error",
            },
            status_code: HttpStatus.BAD_REQUEST,
          };

        let result = await organizationModel.create(modelToSave);

        if (result) return { status_code: HttpStatus.OK, data: result };
        else
          return {
            status_code: HttpStatus.BAD_REQUEST,
            data: {
              message: "Organization Info Not Added",
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
  updateOrganization = async (
    req: Request,
    model: UpdateOrganizationViewmodel
  ): Promise<IServiceResult> => {
    try {
      let foundOrganizationDocs = await organizationModel.findById(model._id);
      if (!foundOrganizationDocs)
        return {
          data: {
            message: "Organization Info Not  Found",
            error: "On Update Error",
          },
          status_code: HttpStatus.BAD_REQUEST,
        };
      else {
        let userDetails = <DocumentType<Employees>>req.user;

        let findRequestUserRoles = await roles.find({
          _id: { $in: userDetails?.roles },
        });
        let findRequestUserRolesDetails = findRequestUserRoles.map((role) => {
          return role.name;
        });

        if (
          !findRequestUserRolesDetails.some((e) =>
            ["masteradmin", "superadmin"].includes(e)
          )
        )
          return {
            data: {
              message: "You Are Not Authorized For Update Organization Details",
              error: "On Update Error",
            },
            status_code: HttpStatus.UNAUTHORIZED,
          };
        else {
          if (model.mobile_number) {
            let phone_no_length = model.mobile_number.toString().length;
            if (phone_no_length > 10)
              return {
                data: {
                  message: "mobile_number Can Not Be Gretaer Than 10 Digits",
                  error: "On Add Error",
                },
                status_code: HttpStatus.BAD_REQUEST,
              };

            if (phone_no_length < 10)
              return {
                data: {
                  message: "mobile_number Can Not Be Less Than 10 Digits",
                  error: "On Add Error",
                },
                status_code: HttpStatus.BAD_REQUEST,
              };
          }
          let modelToSave = <DocumentType<Organization>>model;
          if (model.email) {
            let foundOrganizationEmailExistence =
              await organizationModel.findOne({
                email: model.email.toLowerCase(),
              });
            if (foundOrganizationEmailExistence) {
              if (foundOrganizationEmailExistence._id.toString() != model._id)
                return {
                  data: {
                    message: "Organization Already Exist With This Email",
                    error: "On Update Error",
                  },
                  status_code: HttpStatus.BAD_REQUEST,
                };
            } else modelToSave.email = model.email.toLowerCase();
          }

          let UpdateOrganizationInfoResult = await organizationModel.updateOne(
            { _id: model._id },
            modelToSave
          );

          if (
            UpdateOrganizationInfoResult &&
            UpdateOrganizationInfoResult.modifiedCount > 0
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
  getOrganizationDetails = async (req: Request): Promise<IServiceResult> => {
    try {
      let foundOrganizationDocs = await organizationModel.findById(
        req.params._id
      );

      if (foundOrganizationDocs)
        return { status_code: HttpStatus.OK, data: foundOrganizationDocs };
      else
        return {
          status_code: HttpStatus.BAD_REQUEST,
          data: {
            message: "Organization Info Not Found",
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

  getOrganizationList = async (req: Request): Promise<IServiceResult> => {
    try {
      let foundOrganizationList = await organizationModel.find(
        {},
        { createdAt: 0, updatedAt: 0, __v: 0 }
      );

      if (foundOrganizationList && foundOrganizationList.length > 0)
        return { status_code: HttpStatus.OK, data: foundOrganizationList };
      else
        return {
          status_code: HttpStatus.BAD_REQUEST,
          data: {
            message: "Organization List Not Found",
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
  deleteOrganization = async (req: Request): Promise<IServiceResult> => {
    try {
      let deleteOrganization = await organizationModel.deleteOne({
        _id: req.params._id,
      });

      if (deleteOrganization && deleteOrganization.deletedCount > 0)
        return { status_code: HttpStatus.OK, data: true };
      else
        return {
          status_code: HttpStatus.BAD_REQUEST,
          data: {
            message: "An Error Occurred While Deleting Organization Info",
            Error: "On Delete Error",
          },
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
}
export default new OrganizationService();
