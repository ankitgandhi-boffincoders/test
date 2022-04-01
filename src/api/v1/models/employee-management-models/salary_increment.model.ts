import { getModelForClass, prop, Ref } from "@typegoose/typegoose";
import mongoose from "mongoose";
import { Employees } from "./employee.model";

export class EmployeesSalaryIncrement {
  @prop({ ref: Employees, type: mongoose.Types.ObjectId })
  employee_id!: Ref<Employees>;

  @prop({ type: Number })
  increment_value!: number;

  @prop({ type: Date })
  increment_date!: Date;

  @prop({ type: Number })
  new_salary!: number;
  @prop({ type: Number })
  previous_salary!: number;
}

const EMPLOYEE_SALARY_INCREMENT_DB_MODEL = getModelForClass(EmployeesSalaryIncrement, {
  schemaOptions: {
    collection: "employee_salary_increment",
    timestamps: true,
  },
});
export default EMPLOYEE_SALARY_INCREMENT_DB_MODEL;
