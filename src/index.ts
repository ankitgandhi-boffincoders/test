import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import fileUpload from "express-fileupload";
import mongoose from "mongoose";
import passport from "passport";
import path from "path";
import environment_variables from "./api/v1/common/config/enviorment_config";
import { strategy } from "./api/v1/common/config/passport.config";
import { generate_salary_slip_cron_job } from "./api/v1/common/cronJob/generate_salary_slip_cron_job";
import Routes from "./api/v1/routes";
dotenv.config();

const app = express();
app.use(fileUpload({ useTempFiles: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'))
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
const database = process.env.DB_URL || "";
mongoose
  .connect(database)
  .then(async () => {
    console.log("connected to database");
  })
  .catch((err) => console.log("error mongodb", err));

app.use(passport.initialize());
strategy(passport);
app.use(cors());

generate_salary_slip_cron_job.start();
app.use("/", Routes);
const PORT = process.env.PORT || environment_variables.PORT;
app.listen(PORT, () => console.log(`server running on port:- ${PORT}`));
