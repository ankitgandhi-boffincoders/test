import { NextFunction, Request, Response } from "express";
import HttpStatus from "http-status-codes";
import Utility, { ValidationResult } from "../../../common/common-methods";
import {
  AddDepartmentViewmodel,
  DeleteDepartmentViewmodel,
  GetAllDepartmentListViewmodel,
  GetDepartmentDetailsViewmodel,
  UpdateDepartmentViewmodel
} from "../../../view-models/hr-management-viewmodels/department";
import departmentService from "../department/department.service";


class DepartmentController {
  public addDepartment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let conversionResult: ValidationResult = await Utility.ValidateAndConvert(
        AddDepartmentViewmodel,
        req.body
      );

      if (conversionResult.error && conversionResult.error.length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          status_code: HttpStatus.BAD_REQUEST,
          success: false,
          errors: conversionResult.error,
        });
      } else {
        let model: AddDepartmentViewmodel =
          conversionResult.data as AddDepartmentViewmodel;
        let departmentResult = await departmentService.addDepartment(req, model);
        if (departmentResult && departmentResult.status_code === HttpStatus.OK)
          return res.status(departmentResult.status_code).json({
            status_code: departmentResult.status_code,
            success: true,
            data: departmentResult.data,
          });
        else
          return res.status(departmentResult.status_code).json({
            status_code: departmentResult.status_code,
            success: false,
            errors: [departmentResult.data],
          });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  };
  public updateDepartment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let conversionResult: ValidationResult = await Utility.ValidateAndConvert(
        UpdateDepartmentViewmodel,
        req.body
      );

      if (conversionResult.error && conversionResult.error.length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          status_code: HttpStatus.BAD_REQUEST,
          success: false,
          errors: conversionResult.error,
        });
      } else {
        let model: UpdateDepartmentViewmodel =
          conversionResult.data as UpdateDepartmentViewmodel;
        let departmentResult = await departmentService.updateDepartment(
          req,
          model
        );
        if (departmentResult && departmentResult.status_code === HttpStatus.OK)
          return res.status(departmentResult.status_code).json({
            status_code: departmentResult.status_code,
            success: true,
            data: true,
          });
        else
          return res.status(departmentResult.status_code).json({
            status_code: departmentResult.status_code,
            success: false,
            errors: [departmentResult.data.message],
          });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  };
  public getDepartmentDetails = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let conversionResult: ValidationResult = await Utility.ValidateAndConvert(
        GetDepartmentDetailsViewmodel,
        JSON.parse(`{"_id":"${req.params._id}"}`)
      );

      if (conversionResult.error && conversionResult.error.length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          status_code: HttpStatus.BAD_REQUEST,
          success: false,
          errors: conversionResult.error,
        });
      } else {
        let departmentResult = await departmentService.getDepartmentDetails(req);
        if (departmentResult && departmentResult.status_code === HttpStatus.OK)
          return res.status(departmentResult.status_code).json({
            status_code: departmentResult.status_code,
            success: true,
            data: departmentResult.data,
          });
        else
          return res.status(departmentResult.status_code).json({
            status_code: departmentResult.status_code,
            success: false,
            errors: [departmentResult.data.message],
          });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  };
  public deleteDepartment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let conversionResult: ValidationResult = await Utility.ValidateAndConvert(
        DeleteDepartmentViewmodel,
        JSON.parse(`{"_id":"${req.params._id}"}`)
      );

      if (conversionResult.error && conversionResult.error.length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          status_code: HttpStatus.BAD_REQUEST,
          success: false,
          errors: conversionResult.error,
        });
      } else {
        let departmentResult = await departmentService.deleteDepartment(req);
        if (departmentResult && departmentResult.status_code === HttpStatus.OK)
          return res.status(departmentResult.status_code).json({
            status_code: departmentResult.status_code,
            success: true,
            data: departmentResult.data,
          });
        else
          return res.status(departmentResult.status_code).json({
            status_code: departmentResult.status_code,
            success: false,
            errors: [departmentResult.data.message],
          });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  };
  public listAllDepartment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let conversionResult: ValidationResult = await Utility.ValidateAndConvert(
        GetAllDepartmentListViewmodel,

        JSON.parse(`{"organization_id":"${req.params.organization_id}"}`)
      );

      if (conversionResult.error && conversionResult.error.length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          status_code: HttpStatus.BAD_REQUEST,
          success: false,
          errors: conversionResult.error,
        });
      } else {
        let model: GetAllDepartmentListViewmodel =
          conversionResult.data as GetAllDepartmentListViewmodel;

        let departmentListResult = await departmentService.listAllDepartment(
          req,
          model
        );
        if (
          departmentListResult &&
          departmentListResult.status_code === HttpStatus.OK
        )
          return res.status(departmentListResult.status_code).json({
            status_code: departmentListResult.status_code,
            success: true,
            data: departmentListResult.data,
          });
        else
          return res.status(departmentListResult.status_code).json({
            status_code: departmentListResult.status_code,
            success: false,
            errors: [departmentListResult.data],
          });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  };
}
export default new DepartmentController();
