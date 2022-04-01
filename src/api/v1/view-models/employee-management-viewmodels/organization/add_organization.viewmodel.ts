import { Expose, Type } from "class-transformer";
import {
  IsDefined,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString
} from "class-validator";

export class AddOrganizationViewmodel {
  @Expose()
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @Type(() => String)
  name!: string;

  @Expose()
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @Type(() => String)
  address!: string;

  @Expose()
  @IsDefined()
  @IsInt()
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  mobile_number!: number;

  @Expose()
  @Type(() => String)
  @IsString()
  @IsEmail()
  @IsDefined()
  @IsNotEmpty()
  email!: string;

  @Expose()
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @Type(() => String)
  logo!: string;
}
