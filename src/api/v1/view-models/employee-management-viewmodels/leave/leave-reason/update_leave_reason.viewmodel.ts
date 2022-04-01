import { Expose } from "class-transformer";
import {
    IsDefined,
    IsMongoId,
    IsNotEmpty,
    IsOptional,
    IsString
} from "class-validator";

export class UpdateLeaveReasonViewmodel {
  @Expose()
  @IsMongoId()
  @IsDefined()
  @IsNotEmpty()
  leave_reason_id!: string;

  @IsOptional()
  @Expose()
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  leave_reason?: string;
}
