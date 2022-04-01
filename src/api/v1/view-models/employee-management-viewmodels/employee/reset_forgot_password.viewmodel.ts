import { Expose, Type } from "class-transformer";
import {
  IsDefined,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  Matches,
  MaxLength,
  MinLength
} from "class-validator";

export class ResetForgotPasswordViewmodel {
  @Expose()
  @IsDefined()
  @IsEmail()
  @IsNotEmpty()
  @IsString()
  @Type(() => String)
  email!: string;

  @Expose()
  @IsDefined()
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  otp!: number;

  @Expose()
  @IsDefined()
  @MinLength(4, { message: "password length can not less than 4 character" })
  @MaxLength(6, { message: "password length can not greater than 6 character" })
  @Matches(/^[a-zA-Z0-9]\S*$/, {
    message: "password not contain any space ",
  })
  @IsNotEmpty()
  @IsString()
  @Type(() => String)
  new_password!: string;
}
