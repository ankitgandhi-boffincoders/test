import { NextFunction, Request, Response } from "express";
import HttpStatus from "http-status-codes";
import Utility, { ValidationResult } from "../../../common/common-methods";
import {
  AddOrganizationViewmodel,
  DeleteOrganizationViewmodel,
  GetOrganizationDetailsViewmodel,
  UpdateOrganizationViewmodel
} from "../../../view-models/employee-management-viewmodels/organization";
import organizationService from "./organization.services";
class Organization_Controller {
  //Add OrganizationInfo
  public addOrganization = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let conversionResult: ValidationResult = await Utility.ValidateAndConvert(
        AddOrganizationViewmodel,
        req.body
      );

      if (conversionResult.error && conversionResult.error.length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          status_code: HttpStatus.BAD_REQUEST,
          success: false,
          errors: conversionResult.error,
        });
      } else {
        let model: AddOrganizationViewmodel =
          conversionResult.data as AddOrganizationViewmodel;

        let organizationResult = await organizationService.addOrganization(
          req,
          model
        );
        if (
          organizationResult &&
          organizationResult.status_code === HttpStatus.OK
        )
          return res.status(organizationResult.status_code).json({
            status_code: organizationResult.status_code,
            success: true,
            data: organizationResult.data,
          });
        else
          return res.status(organizationResult.status_code).json({
            status_code: organizationResult.status_code,
            success: false,
            errors: [organizationResult.data],
          });
      }
    } catch (error) {
      next(error);
    }
  };
  //Update OrganizationInfo
  public updateOrganization = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let conversionResult: ValidationResult = await Utility.ValidateAndConvert(
        UpdateOrganizationViewmodel,
        req.body
      );

      if (conversionResult.error && conversionResult.error.length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          status_code: HttpStatus.BAD_REQUEST,
          success: false,
          errors: conversionResult.error,
        });
      } else {
        let model: UpdateOrganizationViewmodel =
          conversionResult.data as UpdateOrganizationViewmodel;

        let organizationResult = await organizationService.updateOrganization(
          req,
          model
        );
        if (
          organizationResult &&
          organizationResult.status_code === HttpStatus.OK
        )
          return res.status(organizationResult.status_code).json({
            status_code: organizationResult.status_code,
            success: true,
            data: organizationResult.data,
          });
        else
          return res.status(organizationResult.status_code).json({
            status_code: organizationResult.status_code,
            success: false,
            errors: [organizationResult.data],
          });
      }
    } catch (error) {
      next(error);
    }
  };

  public getOrganizationDetails = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let conversionResult: ValidationResult = await Utility.ValidateAndConvert(
        GetOrganizationDetailsViewmodel,
        JSON.parse(`{"_id":"${req.params._id}"}`)
      );

      if (conversionResult.error && conversionResult.error.length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          status_code: HttpStatus.BAD_REQUEST,
          success: false,
          errors: conversionResult.error,
        });
      } else {
        let organizationResult =
          await organizationService.getOrganizationDetails(req
            
          );
        if (
          organizationResult &&
          organizationResult.status_code === HttpStatus.OK
        )
          return res.status(organizationResult.status_code).json({
            status_code: organizationResult.status_code,
            success: true,
            data: organizationResult.data,
          });
        else
          return res.status(organizationResult.status_code).json({
            status_code: organizationResult.status_code,
            success: false,
            errors: [organizationResult.data.message],
          });
      }
    } catch (error) {
      next(error);
    }
  };
  
  public getOrganizationList = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      
        let organizationResult =
          await organizationService.getOrganizationList(
            req
          );
        if (
          organizationResult &&
          organizationResult.status_code === HttpStatus.OK
        )
          return res.status(organizationResult.status_code).json({
            status_code: organizationResult.status_code,
            success: true,
            data: organizationResult.data,
          });
        else
          return res.status(organizationResult.status_code).json({
            status_code: organizationResult.status_code,
            success: false,
            errors: [organizationResult.data.message],
          });
      
    } catch (error) {
      next(error);
    }
  };

  public deleteOrganization = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let conversionResult: ValidationResult = await Utility.ValidateAndConvert(
        DeleteOrganizationViewmodel,
        JSON.parse(`{"_id":"${req.params._id}"}`)
      );

      if (conversionResult.error && conversionResult.error.length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          status_code: HttpStatus.BAD_REQUEST,
          success: false,
          errors: conversionResult.error,
        });
      } else {
        let organizationResult =
          await organizationService.deleteOrganization(req
            
          );
        if (
          organizationResult &&
          organizationResult.status_code === HttpStatus.OK
        )
          return res.status(organizationResult.status_code).json({
            status_code: organizationResult.status_code,
            success: true,
            data: organizationResult.data,
          });
        else
          return res.status(organizationResult.status_code).json({
            status_code: organizationResult.status_code,
            success: false,
            errors: [organizationResult.data.message],
          });
      }
    } catch (error) {
      next(error);
    }
  };
}
export default new Organization_Controller();
