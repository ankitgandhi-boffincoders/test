import { getModelForClass, prop } from "@typegoose/typegoose";
export class Roles {
  @prop({ type: String })
  name!: string;
}
const Roles_DB_MODEL = getModelForClass(Roles, {
  schemaOptions: {
    collection: "roles",
  },
});
export default Roles_DB_MODEL;
