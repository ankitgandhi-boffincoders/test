import { Expose } from "class-transformer";
import {
  IsBoolean,
  IsDefined,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString
} from "class-validator";

export class UpdateLeaveDeductionCategoryViewmodel {
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

  @IsOptional()
  @Expose()
  @IsBoolean()
  @IsDefined()
  @IsNotEmpty()
  money_deduct?: boolean;
}
