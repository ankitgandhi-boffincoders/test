import { NextFunction, Request, Response } from "express";
import HttpStatus from "http-status-codes";
import Utility, { ValidationResult } from "../../../common/common-methods";
import {
  AddApplicantViewmodel,
  DeleteApplicantViewmodel,
  GetAllApplicantListViewmodel,
  GetApplicantDetailsViewmodel,
  UpdateApplicantViewmodel
} from "../../../view-models/hr-management-viewmodels/applicant";
import applicantService from "./applicant.service";

class Applicant_Controller {
  public addApplicant = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let conversionResult: ValidationResult = await Utility.ValidateAndConvert(
        AddApplicantViewmodel,
        req.body
      );

      if (conversionResult.error && conversionResult.error.length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          status_code: HttpStatus.BAD_REQUEST,
          success: false,
          errors: conversionResult.error,
        });
      } else {
        let model: AddApplicantViewmodel =
          conversionResult.data as AddApplicantViewmodel;
        let applicantResult = await applicantService.addApplicant(req, model);
        if (applicantResult && applicantResult.status_code === HttpStatus.OK)
          return res.status(applicantResult.status_code).json({
            status_code: applicantResult.status_code,
            success: true,
            data: applicantResult.data,
          });
        else
          return res.status(applicantResult.status_code).json({
            status_code: applicantResult.status_code,
            success: false,
            errors: [applicantResult.data],
          });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  };
  public updateApplicant = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let conversionResult: ValidationResult = await Utility.ValidateAndConvert(
        UpdateApplicantViewmodel,
        req.body
      );

      if (conversionResult.error && conversionResult.error.length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          status_code: HttpStatus.BAD_REQUEST,
          success: false,
          errors: conversionResult.error,
        });
      } else {
        let model: UpdateApplicantViewmodel =
          conversionResult.data as UpdateApplicantViewmodel;
        let applicantResult = await applicantService.updateApplicant(
          req,
          model
        );
        if (applicantResult && applicantResult.status_code === HttpStatus.OK)
          return res.status(applicantResult.status_code).json({
            status_code: applicantResult.status_code,
            success: true,
            data: true,
          });
        else
          return res.status(applicantResult.status_code).json({
            status_code: applicantResult.status_code,
            success: false,
            errors: [applicantResult.data.message],
          });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  };
  public getApplicantDetails = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let conversionResult: ValidationResult = await Utility.ValidateAndConvert(
        GetApplicantDetailsViewmodel,
        JSON.parse(`{"_id":"${req.params._id}"}`)
      );

      if (conversionResult.error && conversionResult.error.length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          status_code: HttpStatus.BAD_REQUEST,
          success: false,
          errors: conversionResult.error,
        });
      } else {
        let applicantResult = await applicantService.getApplicantDetails(req);
        if (applicantResult && applicantResult.status_code === HttpStatus.OK)
          return res.status(applicantResult.status_code).json({
            status_code: applicantResult.status_code,
            success: true,
            data: applicantResult.data,
          });
        else
          return res.status(applicantResult.status_code).json({
            status_code: applicantResult.status_code,
            success: false,
            errors: [applicantResult.data.message],
          });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  };
  public deleteApplicant = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let conversionResult: ValidationResult = await Utility.ValidateAndConvert(
        DeleteApplicantViewmodel,
        JSON.parse(`{"_id":"${req.params._id}"}`)
      );

      if (conversionResult.error && conversionResult.error.length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          status_code: HttpStatus.BAD_REQUEST,
          success: false,
          errors: conversionResult.error,
        });
      } else {
        let applicantResult = await applicantService.deleteApplicant(req);
        if (applicantResult && applicantResult.status_code === HttpStatus.OK)
          return res.status(applicantResult.status_code).json({
            status_code: applicantResult.status_code,
            success: true,
            data: applicantResult.data,
          });
        else
          return res.status(applicantResult.status_code).json({
            status_code: applicantResult.status_code,
            success: false,
            errors: [applicantResult.data.message],
          });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  };
  public listAllApplicant = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let conversionResult: ValidationResult = await Utility.ValidateAndConvert(
        GetAllApplicantListViewmodel,
        req.body
        // JSON.parse(`{"organization_id":"${req.params.organization_id}","profile":"${req.params?.profile}"
        // ,"name":"${req.params?.name}",
        // "company_name":"${req.params?.company_name}",
        // "salary":"${req.params?.salary}",
        // "mobile_no":"${req.params?.mobile_no}",
        // "rejection_reason":"${req.params?.rejection_reason}",
        // "leave_last_company_reason":"${req.params?.leave_last_company_reason}"
        // "experience":"${req.params?.experience}",
        // "linkdin_profile_url":"${req.params?.linkdin_profile_url}"
        // "email":"${req.params?.email}"
        

        //     }`)
      );

      if (conversionResult.error && conversionResult.error.length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          status_code: HttpStatus.BAD_REQUEST,
          success: false,
          errors: conversionResult.error,
        });
      } else {

        let model :GetAllApplicantListViewmodel= conversionResult.data as GetAllApplicantListViewmodel

        let applicantListResult = await applicantService.listAllApplicants(req,model);
        if (
          applicantListResult &&
          applicantListResult.status_code === HttpStatus.OK
        )
          return res.status(applicantListResult.status_code).json({
            status_code: applicantListResult.status_code,
            success: true,
            data: applicantListResult.data,
          });
        else
          return res.status(applicantListResult.status_code).json({
            status_code: applicantListResult.status_code,
            success: false,
            errors: [applicantListResult.data.message],
          });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  };
}
export default new Applicant_Controller();
