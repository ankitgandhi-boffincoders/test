import { Expose, Type } from "class-transformer";
import {
  IsDefined,
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString
} from "class-validator";

export class UpdateOrganizationViewmodel {
  @Expose()
  @IsDefined()
  @IsNotEmpty()
  @IsMongoId()
  @Type(() => String)
  _id!: string;

  @IsOptional()
  @Expose()
  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  mobile_number?: number;

  @IsOptional()
  @Expose()
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @Type(() => String)
  name?: string;

  @IsOptional()
  @Expose()
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @Type(() => String)
  address?: string;

  @IsOptional()
  @Expose()
  @Type(() => String)
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  @IsEmail()
  email?: string;

  @IsOptional()
  @Expose()
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @Type(() => String)
  logo?: string;
}
