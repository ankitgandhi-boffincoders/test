import { DocumentType } from "@typegoose/typegoose";
import { Request } from "express";
import HttpStatus from "http-status-codes";
import { v4 } from "uuid";
import { IServiceResult } from "../../common/common-methods";
import { Employees } from "../../models/employee-management-models/employee.model";
import { default as roles } from "../../models/employee-management-models/roles.model";
import FeedbackModel, {
  Feedback
} from "../../models/feedback.model";
import {
  AddFeedbackReplyViewmodel,
  AddFeedbackViewmodel
} from "../../view-models/feedback";

class FeedbackService {
  addFeedback = async (
    req: Request,
    model: AddFeedbackViewmodel
  ): Promise<IServiceResult> => {
    try {
      let userDetails = <DocumentType<Employees>>req.user;
          
      let modelToSave = <DocumentType<Feedback>>model;
      let feedback_token = v4();
      modelToSave.feedback_token = feedback_token;
      modelToSave. organization_id=userDetails.organization_id!.toString();
      let addFeedbackResult = await FeedbackModel.create(modelToSave);
      if (addFeedbackResult)
        return {
          status_code: HttpStatus.OK,
          data: feedback_token,
        };
      else
        return {
          status_code: HttpStatus.BAD_REQUEST,
          data: {
            message: "An Error Occurred While Adding Feedback",
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
  listAllFeedback = async (req: Request): Promise<IServiceResult> => {
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
            message: "You Are Not Authorized For Getting All Feedback Details",
            error: "On Fetch Error",
          },
          status_code: HttpStatus.UNAUTHORIZED,
        };
      else {
        let feedbackList = await FeedbackModel.find(
          {organization_id:req.params.organization_id},
          { _id: 0, feedback_text: 1,feedback_token:1 }
        );
        if (feedbackList && feedbackList.length > 0)
          return {
            status_code: HttpStatus.OK,

            data: feedbackList,
          };
        else
          return {
            status_code: HttpStatus.BAD_REQUEST,
            data: {
              message: "Feedback List Not Found",
              Error: "On Fetch Error",
            },
          };
      }
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
  getFeedbackDetails = async (req: Request): Promise<IServiceResult> => {
    try {
      let feedbackDetails = await FeedbackModel.findOne({
        feedback_token: req.params.feedback_token,
      });
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
  addFeedbackReply = async (
    req: Request,
    model: AddFeedbackReplyViewmodel
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
            message: "You Are Not Authorized For Add Feedback Reply",
            error: "On Add Error",
          },
          status_code: HttpStatus.UNAUTHORIZED,
        };
      else {
      let modelToSave = <DocumentType<Feedback>>model;

      let addFeedbackReplyResult = await FeedbackModel.create(modelToSave);
      if (addFeedbackReplyResult)
        return {
          status_code: HttpStatus.OK,
          data: addFeedbackReplyResult,
        };
      else
        return {
          status_code: HttpStatus.BAD_REQUEST,
          data: {
            message: "An Error Occurred While Adding Feedback Reply",
            Error: "On Add Error",
          },
        };
    }} catch (error) {
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

  listAllRepliesOfAFeedback = async (req: Request): Promise<IServiceResult> => {
    try {
      
        let feedbackReplyList = await FeedbackModel.find(
          {feedback_token:req.params.feedback_token,reply_text:{ $exists: true }},
          { _id: 0, reply_text: 1 }
        );
        //.sort({updatedAt:-1});

        if (feedbackReplyList && feedbackReplyList.length > 0)
          return {
            status_code: HttpStatus.OK,

            data: feedbackReplyList,
          };
        else
          return {
            status_code: HttpStatus.BAD_REQUEST,
            data: {
              message: "Feedback Reply List Not Found",
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
  getFeedbackReplyDetails = async (req: Request): Promise<IServiceResult> => {
    try {
      let feedbackReplyDetails = await FeedbackModel.findById({
        _id: req.params._id,
       
      });
      if (feedbackReplyDetails && feedbackReplyDetails.reply_text )
        return {
          status_code: HttpStatus.OK,
          data: feedbackReplyDetails,
        };
      else
        return {
          status_code: HttpStatus.BAD_REQUEST,
          data: {
            message: "Feedback Reply Details Not Found",
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
export default new FeedbackService();
