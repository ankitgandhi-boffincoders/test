import { getModelForClass, prop } from "@typegoose/typegoose";
export class LeaveReason {
  @prop({ type: String })
  leave_reason!: string;
}
const Leave_Reason_DB_MODEL = getModelForClass(LeaveReason, {
  schemaOptions: {
    collection: "leave_reason",
  },
});
export default Leave_Reason_DB_MODEL;
