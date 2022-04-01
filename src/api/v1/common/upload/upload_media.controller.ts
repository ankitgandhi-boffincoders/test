import { NextFunction, Request, Response } from "express";
import HttpStatus from "http-status-codes";
import Utility, { ValidationResult } from "../../common/common-methods";
import UploadService from "../../common/upload/upload_media.service";
import {
  DeleteResourcesViewModel,
  UploadAttachmentViewModel,
  UploadMediaViewModel
} from "../../common/upload/upload_viewmodel";
class UploadController {
  public uploadMedia = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let conversionResult: ValidationResult = await Utility.ValidateAndConvert(
        UploadMediaViewModel,
        req.body
      );
      if (!req.files || !req.files.image) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          status_code: HttpStatus.BAD_REQUEST,
          success: false,
          errors: JSON.parse(
            `{"field":"image","message":"image can not be null or undefined"}`
          ),
        });
      }
      if (conversionResult.error && conversionResult.error.length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          status_code: HttpStatus.BAD_REQUEST,
          success: false,
          errors: conversionResult.error,
        });
      } else {
        let model: UploadMediaViewModel =
          conversionResult.data as UploadMediaViewModel;

        let response = await UploadService.uploadPhotoToCloudinary(req);
        if (response && response.status_code === HttpStatus.OK)
          return res.status(HttpStatus.OK).send({
            status_code: HttpStatus.OK,
            success: true,
            data: response.data,
          });
        else
          return res.status(HttpStatus.BAD_REQUEST).send({
            status_code: HttpStatus.BAD_REQUEST,
            success: false,
            errors: [response.data.message],
          });
      }
    } catch (error) {
      console.log(error);

      next(error);
    }
  };
  public uploadResourcesToCloudinary = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let conversionResult: ValidationResult = await Utility.ValidateAndConvert(
        UploadAttachmentViewModel,
        req.body
      );
      if (
        !req.files ||
        !req.files.document ||
        Object.keys(req.files).length === 0
      ) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          status_code: HttpStatus.BAD_REQUEST,
          success: false,
          errors: JSON.parse(
            `{"field":"document","message":"document can not be null or undefined"}`
          ),
        });
      }
      if (conversionResult.error && conversionResult.error.length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          status_code: HttpStatus.BAD_REQUEST,
          success: false,
          errors: conversionResult.error,
        });
      } else {
        let model: UploadAttachmentViewModel =
          conversionResult.data as UploadAttachmentViewModel;

        let response = await UploadService.uploadResourcesToCloudinary(req);
        if (response && response.status_code === HttpStatus.OK)
          return res.status(HttpStatus.OK).send({
            status_code: HttpStatus.OK,
            success: true,
            data: response.data,
          });
        else
          return res.status(HttpStatus.BAD_REQUEST).send({
            status_code: HttpStatus.BAD_REQUEST,
            success: false,
            errors: response.data,
          });
      }
    } catch (error) {
      next(error);
    }
  };

  public deleteResoucesFromCloudinary = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let conversionResult: ValidationResult = await Utility.ValidateAndConvert(
        DeleteResourcesViewModel,
        req.body
      );

      if (conversionResult.error && conversionResult.error.length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          status_code: HttpStatus.BAD_REQUEST,
          success: false,
          errors: conversionResult.error,
        });
      } else {
        let model: DeleteResourcesViewModel =
          conversionResult.data as DeleteResourcesViewModel;

        let response = await UploadService.deleteResoucesFromCloudinary(
          req,
          model
        );
        if (response && response.status_code === HttpStatus.OK)
          return res.status(HttpStatus.OK).send({
            status_code: HttpStatus.OK,
            success: true,
            data: response.data,
          });
        else
          return res.status(HttpStatus.BAD_REQUEST).send({
            status_code: HttpStatus.BAD_REQUEST,
            success: false,
            errors: response.data,
          });
      }
    } catch (error) {
      next(error);
    }
  };
}
export default new UploadController();
