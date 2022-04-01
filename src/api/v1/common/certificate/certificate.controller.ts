import { NextFunction, Request, Response } from "express";
import HttpStatus from "http-status-codes";
import CertificateService from "../certificate/certificate.service";
import Utility, { ValidationResult } from "../common-methods";
import { CertificateViewModel } from "./certificate_viewmodel";
class CertificateController {
  public certificate = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let conversionResult: ValidationResult = await Utility.ValidateAndConvert(
        CertificateViewModel,
        req.body
      );

      if (conversionResult.error && conversionResult.error.length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          status_code: HttpStatus.BAD_REQUEST,
          success: false,
          errors: conversionResult.error,
        });
      } else {
        let model: CertificateViewModel =
          conversionResult.data as CertificateViewModel;

        let response = await CertificateService.certificate(req, res, model);

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
            errors: [response!.data],
          });
      }
    } catch (error) {
      console.log(error);

      next(error);
    }
  };
}
export default new CertificateController();
