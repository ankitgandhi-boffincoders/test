import { NextFunction, Request, Response } from "express";
import HttpStatus from "http-status-codes";
import Utility, { ValidationResult } from "../../common/common-methods";
import { AddFeedbackReplyViewmodel, AddFeedbackViewmodel, GetAllFeedbackListViewmodel, GetFeedbackDetailsViewmodel, GetFeedbackReplyDetailsViewmodel, GetFeedbackReplyListViewmodel } from "../../view-models/feedback";
import feedbackService from "./feedback.service";


class Feedback_Controller {
  //Feedback
  public addFeedback = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let conversionResult: ValidationResult = await Utility.ValidateAndConvert(
        AddFeedbackViewmodel,
        req.body
      );

      if (conversionResult.error && conversionResult.error.length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          status_code: HttpStatus.BAD_REQUEST,
          success: false,
          errors: conversionResult.error,
        });
      } else {
        let model: AddFeedbackViewmodel =
          conversionResult.data as AddFeedbackViewmodel;
        let feedbackResult = await feedbackService.addFeedback(req, model);
        if (feedbackResult && feedbackResult.status_code === HttpStatus.OK)
          return res.status(feedbackResult.status_code).json({
            status_code: feedbackResult.status_code,
            success: true,
            data: feedbackResult.data,
          });
        else
          return res.status(feedbackResult.status_code).json({
            status_code: feedbackResult.status_code,
            success: false,
            errors: [feedbackResult.data],
          });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  };
  
  public getFeedbackDetails = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let conversionResult: ValidationResult = await Utility.ValidateAndConvert(
        GetFeedbackDetailsViewmodel,
        JSON.parse(`{"feedback_token":"${req.params.feedback_token}"}`)
      );

      if (conversionResult.error && conversionResult.error.length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          status_code: HttpStatus.BAD_REQUEST,
          success: false,
          errors: conversionResult.error,
        });
      } else {
        let feedbackResult = await feedbackService.getFeedbackDetails(req);
        if (feedbackResult && feedbackResult.status_code === HttpStatus.OK)
          return res.status(feedbackResult.status_code).json({
            status_code: feedbackResult.status_code,
            success: true,
            data: feedbackResult.data,
          });
        else
          return res.status(feedbackResult.status_code).json({
            status_code: feedbackResult.status_code,
            success: false,
            errors: [feedbackResult.data],
          });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  };

  public listAllFeedback = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try { let conversionResult: ValidationResult = await Utility.ValidateAndConvert(
      GetAllFeedbackListViewmodel,
      JSON.parse(`{"organization_id":"${req.params.organization_id}"}`)
    );

    if (conversionResult.error && conversionResult.error.length > 0) {
      return res.status(HttpStatus.BAD_REQUEST).send({
        status_code: HttpStatus.BAD_REQUEST,
        success: false,
        errors: conversionResult.error,
      });
    } else {

     
      let feedbackResult = await feedbackService.listAllFeedback(req);
      if (feedbackResult && feedbackResult.status_code === HttpStatus.OK)
        return res.status(feedbackResult.status_code).json({
          status_code: feedbackResult.status_code,
          success: true,
          data: feedbackResult.data,
        });
      else
        return res.status(feedbackResult.status_code).json({
          status_code: feedbackResult.status_code,
          success: false,
          errors: [feedbackResult.data],
        });
    } }catch (error) {
      console.log(error);
      next(error);
    }
  };


  // Feedback Reply

  public addFeedbackReply = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let conversionResult: ValidationResult = await Utility.ValidateAndConvert(
        AddFeedbackReplyViewmodel,
        req.body
      );

      if (conversionResult.error && conversionResult.error.length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          status_code: HttpStatus.BAD_REQUEST,
          success: false,
          errors: conversionResult.error,
        });
      } else {
        let model: AddFeedbackReplyViewmodel =
          conversionResult.data as AddFeedbackReplyViewmodel;
        let feedbackReplyResult = await feedbackService.addFeedbackReply(req, model);
        if (feedbackReplyResult && feedbackReplyResult.status_code === HttpStatus.OK)
          return res.status(feedbackReplyResult.status_code).json({
            status_code: feedbackReplyResult.status_code,
            success: true,
            data: feedbackReplyResult.data,
          });
        else
          return res.status(feedbackReplyResult.status_code).json({
            status_code: feedbackReplyResult.status_code,
            success: false,
            errors: [feedbackReplyResult.data],
          });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  };
  
  public getFeedbackReplyDetails = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let conversionResult: ValidationResult = await Utility.ValidateAndConvert(
        GetFeedbackReplyDetailsViewmodel,
        JSON.parse(`{"_id":"${req.params._id}"}`)
      );

      if (conversionResult.error && conversionResult.error.length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          status_code: HttpStatus.BAD_REQUEST,
          success: false,
          errors: conversionResult.error,
        });
      } else {
        let feedbackReplyResult = await feedbackService.getFeedbackReplyDetails(req);
        if (feedbackReplyResult && feedbackReplyResult.status_code === HttpStatus.OK)
          return res.status(feedbackReplyResult.status_code).json({
            status_code: feedbackReplyResult.status_code,
            success: true,
            data: feedbackReplyResult.data,
          });
        else
          return res.status(feedbackReplyResult.status_code).json({
            status_code: feedbackReplyResult.status_code,
            success: false,
            errors: [feedbackReplyResult.data],
          });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  };

  public listAllRepliesOfAFeedback = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
     // 
     let conversionResult: ValidationResult = await Utility.ValidateAndConvert(
      GetFeedbackReplyListViewmodel,
      JSON.parse(`{"feedback_token":"${req.params.feedback_token}"}`)
    );

    if (conversionResult.error && conversionResult.error.length > 0) {
      return res.status(HttpStatus.BAD_REQUEST).send({
        status_code: HttpStatus.BAD_REQUEST,
        success: false,
        errors: conversionResult.error,
      });
    } else {
      let feedbackReplyResult = await feedbackService.listAllRepliesOfAFeedback(req);
      if (feedbackReplyResult && feedbackReplyResult.status_code === HttpStatus.OK)
        return res.status(feedbackReplyResult.status_code).json({
          status_code: feedbackReplyResult.status_code,
          success: true,
          data: feedbackReplyResult.data,
        });
      else
        return res.status(feedbackReplyResult.status_code).json({
          status_code: feedbackReplyResult.status_code,
          success: false,
          errors: [feedbackReplyResult.data],
        });
    }} catch (error) {
      console.log(error);
      next(error);
    }
  };

 }
export default new Feedback_Controller();
