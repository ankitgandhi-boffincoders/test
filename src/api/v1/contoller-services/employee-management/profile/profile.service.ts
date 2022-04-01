import { DocumentType } from "@typegoose/typegoose";
import { Request } from "express";
import HttpStatus from "http-status-codes";
import mongoose from "mongoose";
import { IServiceResult } from "../../../common/common-methods";
import { Employees } from "../../../models/employee-management-models/employee.model";
import profileModel, {
  Profile
} from "../../../models/employee-management-models/profile.model";
import { default as roles } from "../../../models/employee-management-models/roles.model";
import {
  AddProfileViewmodel,
  UpdateProfileViewmodel
} from "../../../view-models/employee-management-viewmodels/profile";
class ProfileService {
  addProfile = async (
    req: Request,
    model: AddProfileViewmodel
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
            message: "You Are Not Authorized For Add New Profile",
            error: "On Add Error",
          },
          status_code: HttpStatus.UNAUTHORIZED,
        };
      else {
        const checkProfileExistence = await profileModel.findOne({
          name: model.name,
        });
        if (checkProfileExistence) {
          return {
            data: {
              message: "Profile Already Exists With This Name",
              error: "On Add Error",
            },
            status_code: HttpStatus.BAD_REQUEST,
          };
        } else {
          let modelToSave = <DocumentType<Profile>>model;

          let addProfileResult = await profileModel.create(modelToSave);
          if (addProfileResult)
            return {
              status_code: HttpStatus.OK,
              data: addProfileResult,
            };
          else
            return {
              status_code: HttpStatus.BAD_REQUEST,
              data: {
                message: "An Error Occurred While Adding Profile",
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
  deleteProfile = async (req: Request): Promise<IServiceResult> => {
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
            message: "You Are Not Authorized For Delete Profile",
            error: "On Delete Error",
          },
          status_code: HttpStatus.UNAUTHORIZED,
        };
      else {
        let deleteProfileResult = await profileModel.deleteOne({
          _id: req.params._id,
        });
        if (deleteProfileResult && deleteProfileResult.deletedCount > 0)
          return {
            status_code: HttpStatus.OK,
            data: true,
          };
        else
          return {
            status_code: HttpStatus.BAD_REQUEST,
            data: {
              message: "An Error Occurred While Deleting Profile",
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
  updateProfile = async (
    req: Request,
    model: UpdateProfileViewmodel
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
            message: "You Are Not Authorized For Add New Profile",
            error: "On Add Error",
          },
          status_code: HttpStatus.UNAUTHORIZED,
        };
      else {
        const checkProfileExistence = await profileModel.findOne({
          name: model.name,
        });
        if (checkProfileExistence) {
          {
            if (checkProfileExistence._id.toString() == model._id) {
              let updateProfile = await profileModel.updateOne(
                { _id: new mongoose.Types.ObjectId(model._id) },
                { name: model.name ?? checkProfileExistence.name }
              );

              return { data: true, status_code: HttpStatus.OK };
            } else
              {
                
                
                
                return {
                data: {
                  message: "Profile Already Exists With This Name",
                  error: "On Update Error",
                },
                status_code: HttpStatus.BAD_REQUEST,
              };}
          }
        } else {
          let updateProfileResult = await profileModel.updateOne(
            { _id: new mongoose.Types.ObjectId(model._id) },
            { name: model.name }
          );
          if (updateProfileResult && updateProfileResult.modifiedCount > 0)
            return {
              status_code: HttpStatus.OK,
              data: true,
            };
          else
            return {
              status_code: HttpStatus.BAD_REQUEST,
              data: {
                message: "An Error Occurred While Updating Profile",
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
  listAllProfile = async (req: Request): Promise<IServiceResult> => {
    try {
      let profileList = await profileModel.find({}, { _id:1, name: 1 });
      if (profileList && profileList.length > 0)
        return {
          status_code: HttpStatus.OK,

          data: profileList,
        };
      else
        return {
          status_code: HttpStatus.BAD_REQUEST,
          data: {
            message: "Profile List Not Found",
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
  getProfileDetails = async (req: Request): Promise<IServiceResult> => {
    try {
      let feedbackDetails = await profileModel.findById(req.params._id);
      if (feedbackDetails)
        return {
          status_code: HttpStatus.OK,
          data: feedbackDetails,
        };
      else
        return {
          status_code: HttpStatus.BAD_REQUEST,
          data: {
            message: "Feedback Details Not Found",
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
}
export default new ProfileService();
