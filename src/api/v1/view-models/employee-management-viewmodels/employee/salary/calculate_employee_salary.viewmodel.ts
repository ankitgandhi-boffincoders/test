import { Ref } from "@typegoose/typegoose";
import { Expose } from "class-transformer";
import {
  IsDefined, IsMongoId,
  IsNotEmpty,
  IsNumber, Max,
  Min
} from "class-validator";
import { Employees } from "../../../../models/employee-management-models/employee.model";

export class CalculateEmployeeSalaryViewmodel {
  @Expose()
  @IsMongoId()
  @IsDefined()
  @IsNotEmpty()
  employee_id!: Ref<Employees>;

  @Expose()
  @Min(1)
  @Max(12)
  @IsNumber()
  @IsDefined()
  @IsNotEmpty()
  month!: number;

  @Expose()
  @Min(1900)
  @Max(3000)
  @IsNumber()
  @IsDefined()
  @IsNotEmpty()
  year!: number;
}
