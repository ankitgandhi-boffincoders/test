import { DocumentType } from "@typegoose/typegoose";
import { Request } from "express";
import HttpStatus from "http-status-codes";
import { IServiceResult } from "../../../common/common-methods";
import applicantModel, {
  Applicant
} from "../../../models/hr-management/applicant.model";
import {
  AddApplicantViewmodel,
  GetAllApplicantListViewmodel,
  UpdateApplicantViewmodel
} from "../../../view-models/hr-management-viewmodels/applicant/index";
class ApplicantService {
  addApplicant = async (
    req: Request,
    model: AddApplicantViewmodel
  ): Promise<IServiceResult> => {
    try {
      let modelToSave = <DocumentType<Applicant>>model;

      let addApplicantResult = await applicantModel.create(modelToSave);
      if (addApplicantResult)
        return {
          status_code: HttpStatus.OK,
          data: addApplicantResult,
        };
      else
        return {
          status_code: HttpStatus.BAD_REQUEST,
          data: {
            message: "An Error Occurred While Adding Applicant",
            Error: "On Add Error",
          },
        };
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
  updateApplicant = async (
    req: Request,
    model: UpdateApplicantViewmodel
  ): Promise<IServiceResult> => {
    try {
      let foundApplicant = await applicantModel.findById(model._id);
      if (foundApplicant) {
        let modelToSave: Applicant = <DocumentType<Applicant>>model;
        modelToSave.organization_id = foundApplicant.organization_id;
        let updatedApplicant = await applicantModel.updateOne(
          { _id: model._id },
          modelToSave
        );

        if (updatedApplicant && updatedApplicant.modifiedCount > 0)
          return {
            status_code: HttpStatus.OK,
            data: true,
          };
        else
          return {
            status_code: HttpStatus.BAD_REQUEST,
            data: {
              message: "An Error Occurred While Updating Applicant",
              Error: "On Update Error",
            },
          };
      } else
        return {
          data: { message: "Applicant Not Found", error: "On Update Error" },
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
  deleteApplicant = async (req: Request): Promise<IServiceResult> => {
    try {
      let deleteApplicantResult = await applicantModel.deleteOne({
        _id: req.params._id,
      });
      if (deleteApplicantResult && deleteApplicantResult.deletedCount > 0)
        return {
          status_code: HttpStatus.OK,
          data: true,
        };
      else
        return {
          status_code: HttpStatus.BAD_REQUEST,
          data: {
            message: "An Error Occurred While Deleting Applicant",
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
  listAllApplicants = async (
    req: Request,
    model: GetAllApplicantListViewmodel
  ): Promise<IServiceResult> => {
    try {
      let applicantList;

      let query: any = {};
      if (req.body) {
        if (req.body.profile) query["profile"] = model.profile;

        if (req.body.name) query["name"] = model.name;

        if (req.body.company_name) query["company_name"] = model.company_name;
        if (req.body.email) query["email"] = model.email!.toLowerCase();
        if (req.body.salary) query["salary"] = model.salary;
        if (req.body.expected_salary)
          query["expected_salary"] = model.expected_salary;
        if (req.body.mobile_no) query["mobile_no"] = model.mobile_no;

        if (req.body.rejection_reason)
          query["rejection_reason"] = model.rejection_reason;

        if (req.body.leave_last_company_reason)
          query["leave_last_company_reason"] = model.leave_last_company_reason;

        if (req.body.experience) query["experience"] = model.experience;

        if (req.body.linkdin_profile_url)
          query["linkdin_profile_url"] = model.linkdin_profile_url;

        // if (model.organization_id)
        //   query["organization_id"] = new mongoose.Types.ObjectId(
        //     model.organization_id
        //   );
      }

      applicantList = await applicantModel.find(query);

      if (applicantList && applicantList.length > 0)
        return {
          status_code: HttpStatus.OK,

          data: applicantList,
        };
      else
        return {
          status_code: HttpStatus.BAD_REQUEST,
          data: {
            message: "Applicants List Not Found",
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
  getApplicantDetails = async (req: Request): Promise<IServiceResult> => {
    try {
      let applicantDetails = await applicantModel.findOne({
        _id: req.params._id,
      });
      if (applicantDetails)
        return {
          status_code: HttpStatus.OK,
          data: applicantDetails,
        };
      else
        return {
          status_code: HttpStatus.BAD_REQUEST,
          data: {
            message: "Applicant Details Not Found",
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
export default new ApplicantService();
