import { NextFunction, Request, Response } from "express";
import HttpStatus from "http-status-codes";
import Utility, { ValidationResult } from "../../../common/common-methods";
import { AddInventoryViewmodel } from "../../../view-models/hr-management-viewmodels/inventory/add_inventory.viewmodel";
import {
  AddInventoryFormViewmodel,
  DeleteInventoryFormViewmodel,
  GetInventoryFormFeildsViewmodel,
  UpdateInventoryFormViewmodel
} from "../../../view-models/hr-management-viewmodels/inventory/forms";
import { GetInventoryViewmodel } from "../../../view-models/hr-management-viewmodels/inventory/get_inventory_details.viewmodel";
import inventoryService from "./inventory.service";

class Inventory_Controller {
  //Inventory Form
  public addInventoryForm = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let conversionResult: ValidationResult = await Utility.ValidateAndConvert(
        AddInventoryFormViewmodel,
        req.body
      );

      if (conversionResult.error && conversionResult.error.length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          status_code: HttpStatus.BAD_REQUEST,
          success: false,
          errors: conversionResult.error,
        });
      } else {
        let model: AddInventoryFormViewmodel =
          conversionResult.data as AddInventoryFormViewmodel;
        let inventoryResult = await inventoryService.addInventoryForm(
          req,
          model
        );
        if (inventoryResult && inventoryResult.status_code === HttpStatus.OK)
          return res.status(inventoryResult.status_code).json({
            status_code: inventoryResult.status_code,
            success: true,
            data: inventoryResult.data,
          });
        else
          return res.status(inventoryResult.status_code).json({
            status_code: inventoryResult.status_code,
            success: false,
            errors: [inventoryResult.data.message],
          });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  };

  public updateInventoryForm = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let conversionResult: ValidationResult = await Utility.ValidateAndConvert(
        UpdateInventoryFormViewmodel,
        req.body
      );

      if (conversionResult.error && conversionResult.error.length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          status_code: HttpStatus.BAD_REQUEST,
          success: false,
          errors: conversionResult.error,
        });
      } else {
        let model: UpdateInventoryFormViewmodel =
          conversionResult.data as UpdateInventoryFormViewmodel;
        let inventoryResult = await inventoryService.updateInventoryForm(
          req,
          model
        );
        if (inventoryResult && inventoryResult.status_code === HttpStatus.OK)
          return res.status(inventoryResult.status_code).json({
            status_code: inventoryResult.status_code,
            success: true,
            data: true,
          });
        else
          return res.status(inventoryResult.status_code).json({
            status_code: inventoryResult.status_code,
            success: false,
            errors: [inventoryResult.data.message],
          });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  };
  public getInventoryFormFeilds = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let conversionResult: ValidationResult = await Utility.ValidateAndConvert(
        GetInventoryFormFeildsViewmodel,
        JSON.parse(`{"key":"${req.params.key}"}`)
      );

      if (conversionResult.error && conversionResult.error.length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          status_code: HttpStatus.BAD_REQUEST,
          success: false,
          errors: conversionResult.error,
        });
      } else {
        let inventoryResult = await inventoryService.getInventoryFormFeilds(
          req
        );
        if (inventoryResult && inventoryResult.status_code === HttpStatus.OK)
          return res.status(inventoryResult.status_code).json({
            status_code: inventoryResult.status_code,
            success: true,
            data: inventoryResult.data,
          });
        else
          return res.status(inventoryResult.status_code).json({
            status_code: inventoryResult.status_code,
            success: false,
            errors: [inventoryResult.data.message],
          });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  };

  public deleteInventoryForm = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let conversionResult: ValidationResult = await Utility.ValidateAndConvert(
        DeleteInventoryFormViewmodel,
        JSON.parse(`{"_id":"${req.params._id}"}`)
      );

      if (conversionResult.error && conversionResult.error.length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          status_code: HttpStatus.BAD_REQUEST,
          success: false,
          errors: conversionResult.error,
        });
      } else {
        let inventoryResult = await inventoryService.deleteInventoryForm(req);
        if (inventoryResult && inventoryResult.status_code === HttpStatus.OK)
          return res.status(inventoryResult.status_code).json({
            status_code: inventoryResult.status_code,
            success: true,
            data: inventoryResult.data,
          });
        else
          return res.status(inventoryResult.status_code).json({
            status_code: inventoryResult.status_code,
            success: false,
            errors: [inventoryResult.data.message],
          });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  };
  public listAllInventoryForm = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let inventoryResult = await inventoryService.listAllInventoryForm(req);
      if (inventoryResult && inventoryResult.status_code === HttpStatus.OK)
        return res.status(inventoryResult.status_code).json({
          status_code: inventoryResult.status_code,
          success: true,
          data: inventoryResult.data,
        });
      else
        return res.status(inventoryResult.status_code).json({
          status_code: inventoryResult.status_code,
          success: false,
          errors: [inventoryResult.data.message],
        });
    } catch (error) {
      console.log(error);
      next(error);
    }
  };

  //Inventory

  public addInventory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let conversionResult: ValidationResult = await Utility.ValidateAndConvert(
        AddInventoryViewmodel,
        req.body
      );

      if (conversionResult.error && conversionResult.error.length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          status_code: HttpStatus.BAD_REQUEST,
          success: false,
          errors: conversionResult.error,
        });
      } else {
        let model: AddInventoryViewmodel =
          conversionResult.data as AddInventoryViewmodel;
        let inventoryResult = await inventoryService.addInventory(req, model);
        if (inventoryResult && inventoryResult.status_code === HttpStatus.OK)
          return res.status(inventoryResult.status_code).json({
            status_code: inventoryResult.status_code,
            success: true,
            data: inventoryResult.data,
          });
        else
          return res.status(inventoryResult.status_code).json({
            status_code: inventoryResult.status_code,
            success: false,
            errors: [inventoryResult.data.message],
          });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  };
  
  public getInventoryDetails = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let conversionResult: ValidationResult = await Utility.ValidateAndConvert(
        GetInventoryViewmodel,
        JSON.parse(`{"key":"${req.params.key}"}`)
      );

      if (conversionResult.error && conversionResult.error.length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          status_code: HttpStatus.BAD_REQUEST,
          success: false,
          errors: conversionResult.error,
        });
      } else {
        let model: GetInventoryViewmodel =
          conversionResult.data as GetInventoryViewmodel;
        let inventoryResult = await inventoryService.getInventoryDetails(req);
        if (inventoryResult && inventoryResult.status_code === HttpStatus.OK)
          return res.status(inventoryResult.status_code).json({
            status_code: inventoryResult.status_code,
            success: true,
            data: inventoryResult.data,
          });
        else
          return res.status(inventoryResult.status_code).json({
            status_code: inventoryResult.status_code,
            success: false,
            errors: [inventoryResult.data.message],
          });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  };
}
export default new Inventory_Controller();
