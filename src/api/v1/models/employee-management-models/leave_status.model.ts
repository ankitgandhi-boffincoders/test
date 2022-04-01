import { getModelForClass, prop } from "@typegoose/typegoose";
export class LeaveStatus {
  @prop({ type: String })
  leave_status!: string;

  @prop({ type: Boolean })
  is_default!: boolean;

  @prop({ type: Boolean ,default:false})
  leave_count_as!: boolean;

}
const Leave_Status_DB_MODEL = getModelForClass(LeaveStatus, {
  schemaOptions: {
    collection: "leave_status",
  },
});
export default Leave_Status_DB_MODEL;
