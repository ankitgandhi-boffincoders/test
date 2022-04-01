import { Ref } from "@typegoose/typegoose";
import { Expose, Type } from "class-transformer";
import {
  IsDate,
  IsDefined,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString
} from "class-validator";
import mongoose from 'mongoose';
import { Employees } from "../../../models/employee-management-models/employee.model";

export class UpdateLeaveViewmodel {
  @Expose()
  @IsMongoId()
  @IsDefined()
  @IsNotEmpty()
  _id!: string;

  @IsOptional()
  @Expose()
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @Type(() => String)
  reason?: string;

  @IsOptional()
  @Expose()
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @Type(() => String)
  description?: string;

  @IsOptional()
  @Expose()
  @IsDefined()
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  from_date?: Date;

  @IsOptional()
  @Expose()
  @IsDefined()
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  to_date?: Date;

  @Expose()
  leave_status!: string;

  @IsOptional()
  @Expose()
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @Type(() => String)
  leave_type?: mongoose.Types.ObjectId;

  @Expose()
  approval_remarks!: string;

  @Expose()
  attachment!: string[];
  @Expose()
  deduction_category!: mongoose.Types.ObjectId;

  @Expose()
  employee_id!: Ref<Employees>;

  @Expose()
  leave_count_as!: boolean;

  @Expose()
  leave_status_update_by!: string;
}
