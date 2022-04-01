import { Expose, Type } from "class-transformer";
import { IsDefined, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class AddLeaveTypeViewmodel {
  @Expose()
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  leave_type!: string;

  @Expose()
  @IsNumber()
  @IsDefined()
  @IsNotEmpty()
  @Type(()=>Number)
  deduction_value!: number;
}
