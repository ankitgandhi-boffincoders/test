import { Ref } from "@typegoose/typegoose";
import { Expose } from "class-transformer";
import {
  IsDefined,
  IsMongoId,
  IsNotEmpty
} from "class-validator";
import { Employees } from "../../../../models/employee-management-models/employee.model";

export class GetEmployeeSalaryIncremetListViewmodel {
  @Expose()
  @IsMongoId()
  @IsDefined()
  @IsNotEmpty()
  employee_id!: Ref<Employees>;
}
