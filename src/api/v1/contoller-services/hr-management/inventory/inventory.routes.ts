import express from "express";
import passport from "passport";
import Inventory_Controller from "./inventory.controller";
export class Inventory_Router {
  public router = express.Router();

  constructor() {
    this.config();
  }

  private config(): void {
    //Inventory Form Routes
    this.router.post(
      "/add_form",
      passport.authenticate("jwt", { session: false }),
      Inventory_Controller.addInventoryForm
    );

    this.router.put(
      "/update_form",
      passport.authenticate("jwt", { session: false }),
      Inventory_Controller.updateInventoryForm
    );

    this.router.get(
      "/form_list",
      passport.authenticate("jwt", { session: false }),
      Inventory_Controller.listAllInventoryForm
    );
    this.router.get(
      "/form_feilds/:key",
      passport.authenticate("jwt", { session: false }),
      Inventory_Controller.getInventoryFormFeilds
    );
    this.router.delete(
      "/delete_form/:_id",
      passport.authenticate("jwt", { session: false }),
      Inventory_Controller.deleteInventoryForm
    );

    //Inventory Routes

    this.router.post(
      "/add",
      passport.authenticate("jwt", { session: false }),
      Inventory_Controller.addInventory
    );

    this.router.get(
      "/details/:key",
      passport.authenticate("jwt", { session: false }),
      Inventory_Controller.getInventoryDetails
    );
  }
}
export default new Inventory_Router().router;
