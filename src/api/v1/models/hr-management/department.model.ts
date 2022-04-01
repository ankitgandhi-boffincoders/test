import { getModelForClass, prop, Ref } from "@typegoose/typegoose";
import mongoose from "mongoose";
import { Organization } from "../employee-management-models/organization.model";
export class Department {
  @prop({ type: String })
  name!: string;

  @prop({ ref: Organization, type: mongoose.Types.ObjectId })
  organization_id!: Ref<Organization> | null;
}

const Department_DB_MODEL = getModelForClass(Department, {
  schemaOptions: {
    collection: "department",
    timestamps: true,
  },
});
export default Department_DB_MODEL;
