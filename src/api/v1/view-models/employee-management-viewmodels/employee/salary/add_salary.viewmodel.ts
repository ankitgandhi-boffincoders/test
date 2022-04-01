import { Ref } from "@typegoose/typegoose";
import { Expose, Type } from "class-transformer";
import { IsDefined, IsMongoId, IsNotEmpty, IsNumber } from "class-validator";
import { Employees } from "../../../../models/employee-management-models/employee.model";

export class AddEmployeeSalaryViewmodel {
  @Expose()
  @IsMongoId()
  @IsDefined()
  @IsNotEmpty()
  employee_id!: Ref<Employees>;

  @Expose()
  @IsNumber()
  @IsDefined()
  @IsNotEmpty()
  @Type(() => Number)
  salary!: number;

  @Expose()
  increment_value!: number;

  @Expose()
  increment_date!: string;
}
