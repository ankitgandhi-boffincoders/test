import { Expose } from "class-transformer";
import { IsDefined, IsMongoId, IsNotEmpty, IsString } from "class-validator";

export class LeaveHistoryViewmodel {
  @Expose()
  @IsString()
  @IsMongoId()
  @IsDefined()
  @IsNotEmpty()
  employee_id!: string;
}
