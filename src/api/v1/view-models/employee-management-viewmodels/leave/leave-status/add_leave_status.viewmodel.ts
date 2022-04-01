import { Expose } from "class-transformer";
import { IsBoolean, IsDefined, IsNotEmpty, IsString } from "class-validator";

export class AddLeaveStatusViewmodel {
  @Expose()
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  leave_status!: string;

  @Expose()
  @IsBoolean()
  @IsDefined()
  @IsNotEmpty()
  is_default!: boolean;

  @Expose()
  @IsBoolean()
  @IsDefined()
  @IsNotEmpty()
  leave_count_as!: boolean;
}
