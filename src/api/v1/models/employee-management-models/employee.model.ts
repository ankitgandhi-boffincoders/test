import { getModelForClass, prop, Ref } from "@typegoose/typegoose";
import mongoose from "mongoose";
import { Organization } from "./organization.model";
import { Profile } from "./profile.model";
import { Roles } from "./roles.model";

export enum ERolevalues {
  MANAGER = "manager",
  EMPLOYEE = "employee",
  SUPERADMIN = "superadmin",
  HR="hr"
}

export class Employees {
  @prop({ type: String })
  fullname!: string;
  @prop({ ref: Profile, type: mongoose.Types.ObjectId })
  designation!: Ref<Profile> | null;

  @prop({ ref: Employees, type: String })
  manager!: string[];

  @prop({ type: String })
  email!: string;

  @prop({ type: String })
  emp_personal_email!: string;

  @prop({ type: String })
  password!: string | null;

  @prop({ ref: Roles, type: [String] })
  roles!: string[];

  @prop({ type: Boolean })
  is_deleted!: boolean;

  @prop({ type: Number, default: 0 })
  salary!: number;

  @prop({ type: String })
  image!: string | null;

  @prop({ ref: Organization, type: mongoose.Types.ObjectId })
  organization_id!: Ref<Organization> | null;

  @prop({ type: String, default: "" })
  bank_name!: string;
  @prop({ type: String, default: "" })
  department!: string;
  @prop({ type: String, default: "" })
  pf_no!: string;
  @prop({ type: String, default: "" })
  uan!: string;
  @prop({ type: String, default: "" })
  esi_no!: string;
  @prop({ type: Date,})
  date_of_joining!: Date;
  @prop({ type: String, default: "" })
  empId!: string;
  @prop({ type: String, default: "" })
  bank_acc_no!: string;

  @prop({ type: [String], })
  certificates!: string[];
}

const EMPLOYEE_DB_MODEL = getModelForClass(Employees, {
  schemaOptions: {
    collection: "employees",
    timestamps: true,
  },
});
export default EMPLOYEE_DB_MODEL;
