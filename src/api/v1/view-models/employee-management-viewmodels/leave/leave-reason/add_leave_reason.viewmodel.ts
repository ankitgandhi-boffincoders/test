import { Expose } from "class-transformer";
import { IsDefined, IsNotEmpty, IsString } from "class-validator";

export class AddLeaveReasonViewmodel {
  @Expose()
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  leave_reason!: string;
}
