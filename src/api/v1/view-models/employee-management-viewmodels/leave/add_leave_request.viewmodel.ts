import { Ref } from "@typegoose/typegoose";
import { Expose, Type } from "class-transformer";
import {
  IsDate,
  IsDefined, IsMongoId,
  IsNotEmpty,
  IsString
} from "class-validator";
import mongoose from 'mongoose';
import { LeaveTypes } from "../../../models/employee-management-models/leave_type.model";

export class AddLeaveViewmodel {
  // @Expose()
  // @IsMongoId()
  // @IsDefined()
  // @IsNotEmpty()
  // employee_id!: Ref<Employees>;

  @Expose()
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @Type(() => String)
  reason!: string;

  @Expose()
  attachment!: string[];

  @Expose()
  deduction_category!: mongoose.Types.ObjectId;
  @Expose()
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @Type(() => String)
  description!: string;

  @Expose()
  @IsDefined()
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  from_date!: Date;

  @Expose()
  @IsDefined()
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  to_date!: Date;

  @Expose()
  leave_status!: string;

  @Expose()
  @IsDefined()
  @IsNotEmpty()
  @IsMongoId()
  @Type(() => String)
  leave_type!: Ref<LeaveTypes>;

  @Expose()
  approval_remarks!: string;
  @Expose()
  leave_count_as!: boolean;

}
