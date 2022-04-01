import { Ref } from "@typegoose/typegoose";
import { Expose } from "class-transformer";
import {
  IsDefined,
  IsMongoId,
  IsNotEmpty,
  IsNumber
} from "class-validator";
import { Employees } from "../../../../models/employee-management-models/employee.model";

export class UpdateEmployeeSalaryViewmodel {
  @Expose()
  @IsMongoId()
  @IsDefined()
  @IsNotEmpty()
  employee_id!: Ref<Employees>;

  @Expose()
  @IsNumber()
  @IsDefined()
  @IsNotEmpty()
  increment_value!: number;

  @Expose()
  increment_date!: Date;
}
