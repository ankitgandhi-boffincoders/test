import { getModelForClass, prop } from "@typegoose/typegoose";

export class InventoryObjectProperties {

  @prop({ type: String})
  feild_id!: string;
  @prop({ type: String })
  title!: string;
  @prop({ type: String })
  type!: string;
  @prop({ type: Boolean })
  is_required!: boolean;
  @prop({ type: String,default:""  })
  regex!: string;
  @prop({ type: String,default:"" })
  regex_error!: string;
  @prop({ type: String,default:""})
  is_required_error!: string;
}
export class InventoryForm {
  @prop({ type: String })
  key!: string;

  @prop({ _id: false, type: InventoryObjectProperties })
  feilds!: InventoryObjectProperties[];
}
const Inventory_FORM_DB_MODEL = getModelForClass(InventoryForm, {
  schemaOptions: {
    collection: "inventory_form",
  },
});
export default Inventory_FORM_DB_MODEL;
