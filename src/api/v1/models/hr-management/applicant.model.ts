import { getModelForClass, prop, Ref } from "@typegoose/typegoose";
import mongoose from "mongoose";
import { Organization } from "../employee-management-models/organization.model";
export class Applicant {
  @prop({ type: String })
  name!: string;
  @prop({ type: String, default: "" })
  company_name!: string;
  @prop({ type: String })
  email!: string;
  @prop({ type: Number })
  salary!: number;
  @prop({ type: Number })
  expected_salary!: number;
  @prop({ type: Number })
  mobile_no!: number;
  @prop({ type: String })
  cv_attachment!: string;

  @prop({ ref: Organization, type: mongoose.Types.ObjectId })
  organization_id!: Ref<Organization> | null;

  @prop({ type: String })
  designation!: string;
  @prop({ type: String, default: "" })
  rejection_reason!: string;

  @prop({ type: String, default: "" })
  leave_last_company_reason!: string;

  @prop({ type: String, default: "" })
  experience!: string;

  @prop({ type: String, default: "" })
  linkdin_profile_url!: string;
}

const Applicant_DB_MODEL = getModelForClass(Applicant, {
  schemaOptions: {
    collection: "applicant_records",
    timestamps: true,
  },
});
export default Applicant_DB_MODEL;
