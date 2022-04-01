import { getModelForClass, prop } from "@typegoose/typegoose";


export class Organization {
  @prop({ type: String })
  name!: string;
  @prop({ type: String })
  address!: string;
  @prop({ type: String })
  email!: string;
  @prop({ type: String })
  logo!: string | null;
  @prop({ type: Number })
  mobile_number!: number;
  
}

const ORGANIZATION_INFO_DB_MODEL = getModelForClass(Organization, {
  schemaOptions: {
    collection: "organization",
    timestamps: true,
  },
});
export default ORGANIZATION_INFO_DB_MODEL;
