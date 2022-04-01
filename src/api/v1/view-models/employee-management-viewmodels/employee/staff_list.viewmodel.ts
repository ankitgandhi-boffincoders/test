import { Expose } from "class-transformer";
import {
    IsDefined, IsMongoId, IsNotEmpty,
    IsString
} from "class-validator";

export class StaffListViewmodel {
  @Expose()
  @IsDefined()
  @IsMongoId()
  @IsNotEmpty()
  @IsString()
  manager_id!: string;

}