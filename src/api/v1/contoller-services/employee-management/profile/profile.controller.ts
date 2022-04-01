import { NextFunction, Request, Response } from "express";
import HttpStatus from "http-status-codes";
import Utility, { ValidationResult } from "../../../common/common-methods";
import {
  AddProfileViewmodel,
  DeleteProfileViewmodel,
  GetProfileDetailsViewmodel,
  UpdateProfileViewmodel
} from "../../../view-models/employee-management-viewmodels/profile";
import ProfileService from "./profile.service";

class Profile_Controller {
  public addProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let conversionResult: ValidationResult = await Utility.ValidateAndConvert(
        AddProfileViewmodel,
        req.body
      );

      if (conversionResult.error && conversionResult.error.length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          status_code: HttpStatus.BAD_REQUEST,
          success: false,
          errors: conversionResult.error,
        });
      } else {
        let model: AddProfileViewmodel =
          conversionResult.data as AddProfileViewmodel;
        let profileResult = await ProfileService.addProfile(req, model);
        if (profileResult && profileResult.status_code === HttpStatus.OK)
          return res.status(profileResult.status_code).json({
            status_code: profileResult.status_code,
            success: true,
            data: profileResult.data,
          });
        else
          return res.status(profileResult.status_code).json({
            status_code: profileResult.status_code,
            success: false,
            errors: [profileResult.data],
          });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  };
  public updateProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let conversionResult: ValidationResult = await Utility.ValidateAndConvert(
        UpdateProfileViewmodel,
        req.body
      );

      if (conversionResult.error && conversionResult.error.length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          status_code: HttpStatus.BAD_REQUEST,
          success: false,
          errors: conversionResult.error,
        });
      } else {
        let model: UpdateProfileViewmodel =
          conversionResult.data as UpdateProfileViewmodel;
        let profileResult = await ProfileService.updateProfile(req, model);
        if (profileResult && profileResult.status_code === HttpStatus.OK)
          return res.status(profileResult.status_code).json({
            status_code: profileResult.status_code,
            success: true,
            data: profileResult.data,
          });
        else
          return res.status(profileResult.status_code).json({
            status_code: profileResult.status_code,
            success: false,
            errors: [profileResult.data],
          });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  };
  public deleteProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let conversionResult: ValidationResult = await Utility.ValidateAndConvert(
        DeleteProfileViewmodel,
        JSON.parse(`{"_id":"${req.params._id}"}`)
      );

      if (conversionResult.error && conversionResult.error.length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          status_code: HttpStatus.BAD_REQUEST,
          success: false,
          errors: conversionResult.error,
        });
      } else {
        let model: DeleteProfileViewmodel =
          conversionResult.data as DeleteProfileViewmodel;
        let profileResult = await ProfileService.deleteProfile(req);
        if (profileResult && profileResult.status_code === HttpStatus.OK)
          return res.status(profileResult.status_code).json({
            status_code: profileResult.status_code,
            success: true,
            data: profileResult.data,
          });
        else
          return res.status(profileResult.status_code).json({
            status_code: profileResult.status_code,
            success: false,
            errors: [profileResult.data],
          });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  };
  public getProfileDetails = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let conversionResult: ValidationResult = await Utility.ValidateAndConvert(
        GetProfileDetailsViewmodel,
        JSON.parse(`{"_id":"${req.params._id}"}`)
      );

      if (conversionResult.error && conversionResult.error.length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          status_code: HttpStatus.BAD_REQUEST,
          success: false,
          errors: conversionResult.error,
        });
      } else {
        let profileResult = await ProfileService.getProfileDetails(req);
        if (profileResult && profileResult.status_code === HttpStatus.OK)
          return res.status(profileResult.status_code).json({
            status_code: profileResult.status_code,
            success: true,
            data: profileResult.data,
          });
        else
          return res.status(profileResult.status_code).json({
            status_code: profileResult.status_code,
            success: false,
            errors: [profileResult.data],
          });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  };
  public listAllProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let profileResult = await ProfileService.listAllProfile(req);
      if (profileResult && profileResult.status_code === HttpStatus.OK)
        return res.status(profileResult.status_code).json({
          status_code: profileResult.status_code,
          success: true,
          data: profileResult.data,
        });
      else
        return res.status(profileResult.status_code).json({
          status_code: profileResult.status_code,
          success: false,
          errors: [profileResult.data],
        });
    } catch (error) {
      console.log(error);
      next(error);
    }
  };
}
export default new Profile_Controller();
