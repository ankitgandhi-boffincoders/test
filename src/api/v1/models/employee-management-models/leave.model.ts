import { getModelForClass, prop, Ref } from "@typegoose/typegoose";
import mongoose from "mongoose";
import { Employees } from "./employee.model";
import { LeaveDeductionCategory } from "./leave_deduction_category.model";
import { LeaveTypes } from "./leave_type.model";

export enum EReasonvalues {
  CASUALLEAVE = "casual_leave",
  SICKLEAVE = "sick_leave",
  MATERNITYLEAVE = "maternity_leave",
  MARRIAGELEAVE = "marriage_leave",
  BEREAVEMENTLEAVE = "bereavement_leave",
  OTHERS = "others",
}

export class Leave {
  @prop({ type: String })
  reason!: string;

  @prop({ ref: Employees, type: mongoose.Types.ObjectId })
  employee_id: Ref<Employees> | null;

  @prop({ type: String })
  leave_status!: string;

  @prop({ type: String })
  description!: string;

  @prop({ type: String, default: "" })
  approval_remarks!: string;
  @prop({ type: Date })
  from_date!: Date;

  @prop({ type: Date })
  to_date!: Date;

  @prop({ ref: LeaveTypes, type: mongoose.Types.ObjectId })
  leave_type!: Ref<LeaveTypes>;

  @prop({ type: [String], default: "" })
  attachment!: string[];

  @prop({ type: Boolean, default: false })
  leave_count_as!: boolean;

  @prop({ref: LeaveDeductionCategory, type: mongoose.Types.ObjectId })
  deduction_category!: Ref<LeaveDeductionCategory>;

  @prop({ type: String, default: "" })
  leave_status_update_by!: string;
}

const Leave_DB_MODEL = getModelForClass(Leave, {
  schemaOptions: {
    collection: "leave",
    timestamps: true,
  },
});
export default Leave_DB_MODEL;
