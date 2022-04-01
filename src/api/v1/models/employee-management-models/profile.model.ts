import { getModelForClass, prop } from "@typegoose/typegoose";

export class Profile {
  @prop({ type: String })
  name!: string;
}

const Profile_DB_MODEL = getModelForClass(Profile, {
  schemaOptions: {
    collection: "profile",
    timestamps: true,
  },
});
export default Profile_DB_MODEL;
