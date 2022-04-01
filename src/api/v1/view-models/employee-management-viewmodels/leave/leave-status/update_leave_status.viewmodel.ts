import { Expose } from "class-transformer";
import { IsBoolean, IsDefined, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateLeaveStatusViewmodel {
  @Expose()
  @IsMongoId()
  @IsDefined()
  @IsNotEmpty()
  leave_status_id!: string;

  @IsOptional()
  @Expose()
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  leave_status?: string;

  @IsOptional()
  @Expose()
  @IsBoolean()
  @IsDefined()
  @IsNotEmpty()
  is_default?: boolean;

  @IsOptional()
  @Expose()
  @IsBoolean()
  @IsDefined()
  @IsNotEmpty()
  leave_count_as?: boolean;
}
