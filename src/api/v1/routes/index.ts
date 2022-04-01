import * as express from "express";
import MainRoutes from "./routes";

class Routes {
  public router = express.Router();

  constructor() {
    this.config();
  }

  private config(): void {
    this.router.use("/api/v1", MainRoutes);
  }
}

export default new Routes().router;
