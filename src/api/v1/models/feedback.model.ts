import { getModelForClass, prop } from "@typegoose/typegoose";

export class Feedback {
  @prop({required:false, type: String })
  feedback_text!: string;

  @prop({ type: String ,default:""})
  feedback_token!: string;

  @prop({ type: String ,})
  organization_id!: string;

  @prop({ required:false,type: String })
  reply_text!: string;
}

const Feedback_DB_MODEL = getModelForClass(Feedback, {
  schemaOptions: {
    collection: "feedback",
    timestamps: true,
    strict: false,
  },
});
export default Feedback_DB_MODEL;
