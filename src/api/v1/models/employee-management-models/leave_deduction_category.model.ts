import { getModelForClass, prop } from "@typegoose/typegoose";
export class LeaveDeductionCategory {
  @prop({ type: String })
  name!: string;
  @prop({ type: Boolean })
  money_deduct!: boolean;
}
const Leave_Deduction_Category_DB_MODEL = getModelForClass(
  LeaveDeductionCategory,
  {
    schemaOptions: {
      collection: "leave_deduction_category",
    },
  }
);
export default Leave_Deduction_Category_DB_MODEL;
