import { Expose, Type } from "class-transformer";
import {
  IsDefined,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";

export class LeaveApprovalViewmodel {
  @Expose()
  @IsString()
  @IsMongoId()
  @IsDefined()
  @IsNotEmpty()
  leave_id!: string;

  @Expose()
  @IsDefined()
  @IsMongoId()
  @Type(() => String)
  @IsNotEmpty()
  approval_status!: string;

  @Expose()
  @IsDefined()
  @IsMongoId()
  @Type(() => String)
  @IsNotEmpty()
  deduction_category!: string;

  @IsOptional()
  @Expose()
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @Type(() => String)
  approval_remarks?: string;
}
