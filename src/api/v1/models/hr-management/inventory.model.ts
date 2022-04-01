import { getModelForClass, prop } from "@typegoose/typegoose";

export class Inventory {
  @prop({ type: String })
  key!: string;

  @prop({ _id: false })
  feilds!: any;
}

const Inventory_DB_MODEL = getModelForClass(Inventory, {
  schemaOptions: {
    collection: "inventory",
    timestamps:true,strict:false
  },
});
export default Inventory_DB_MODEL;
