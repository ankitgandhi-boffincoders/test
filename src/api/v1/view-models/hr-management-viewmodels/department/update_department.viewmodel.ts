import { Expose } from "class-transformer";
import {
  IsDefined,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString
} from "class-validator";

export class UpdateDepartmentViewmodel {
  @Expose()
  @IsMongoId()
  @IsDefined()
  @IsNotEmpty()
  _id!: string;

  @IsOptional()
  @Expose()
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  name?: string;
}
