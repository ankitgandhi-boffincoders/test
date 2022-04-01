import { Expose, Type } from "class-transformer";
import {
  IsDefined,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString
} from "class-validator";

export class UpdateLeaveTypeViewmodel {
  @Expose()
  @IsMongoId()
  @IsDefined()
  @IsNotEmpty()
  leave_type_id!: string;

  @IsOptional()
  @Expose()
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  @Type(() => String)
  leave_type!: string;

  @IsOptional()
  @Expose()
  @IsNumber()
  @IsDefined()
  @IsNotEmpty()
  @Type(()=>Number)
  deduction_value!: number;
}
