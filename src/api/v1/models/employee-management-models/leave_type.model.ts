import { getModelForClass, prop } from "@typegoose/typegoose";
export class LeaveTypes {
  @prop({ type: String })
  leave_type!: string;
  @prop({ type: Number })
  deduction_value!: number;
  
}
const Leave_Type_DB_MODEL = getModelForClass(LeaveTypes, {
  schemaOptions: {
    collection: "leave_type",
  },
});
export default Leave_Type_DB_MODEL;
