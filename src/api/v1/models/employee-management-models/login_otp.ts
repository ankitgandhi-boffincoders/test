import { getModelForClass, mongoose, prop } from "@typegoose/typegoose";

export class LoginOTPs  {
  @prop({ type: mongoose.Types.ObjectId })
  emp_id!: mongoose.Types.ObjectId;

  @prop({ type: Number })
  otp!: number;

  @prop({ type: Number })
  otp_generation_time!: number;

}

 const LOGIN_OTP_MODEL = getModelForClass(LoginOTPs, {
  schemaOptions: {
    collection: "login_otps",
    timestamps: true,
  },
});

export default LOGIN_OTP_MODEL;