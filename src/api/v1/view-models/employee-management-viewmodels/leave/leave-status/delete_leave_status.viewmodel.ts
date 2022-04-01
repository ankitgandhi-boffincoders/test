import { Expose } from "class-transformer";
import { IsDefined, IsMongoId, IsNotEmpty } from 'class-validator';

export class DeleteLeaveStatusViewmodel {
  @Expose()
  @IsMongoId()
  @IsDefined()
  @IsNotEmpty()
  leave_status_id!: string;

  
}
