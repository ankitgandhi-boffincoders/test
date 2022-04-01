import express from "express";
import passport from "passport";
import Feedback_Controller from "./feedback.controller";
export class Feedback_Router {
  public router = express.Router();

  constructor() {
    this.config();
  }

  private config(): void {
    this.router.post(
      "/add",
      passport.authenticate("jwt", { session: false }),
      Feedback_Controller.addFeedback
    );
    this.router.get(
      "/:organization_id",
      passport.authenticate("jwt", { session: false }),
      Feedback_Controller.listAllFeedback
    );
    this.router.get(
      "/:feedback_token",
      passport.authenticate("jwt", { session: false }),
      Feedback_Controller.getFeedbackDetails
    );
   
    //feedback reply routes

    this.router.post(
      "/reply/add",
      passport.authenticate("jwt", { session: false }),
      Feedback_Controller.addFeedbackReply
    );
    this.router.get(
      "/reply/:_id",
      passport.authenticate("jwt", { session: false }),
      Feedback_Controller.getFeedbackReplyDetails
    );
    this.router.get(
      "/reply_all/:feedback_token",
      passport.authenticate("jwt", { session: false }),
      Feedback_Controller.listAllRepliesOfAFeedback
    );
    


  }
}
export default new Feedback_Router().router;
