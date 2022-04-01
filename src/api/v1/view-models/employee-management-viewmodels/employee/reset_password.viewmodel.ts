import { Expose, Type } from "class-transformer";
import {
    IsDefined,
    IsEmail,
    IsNotEmpty, IsString,
    Matches,
    MaxLength,
    MinLength
} from "class-validator";

export class ResetPasswordViewModel {
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
  @Type(() => String)
  @IsString()
  password!: string;

  @Expose()
  @IsDefined()
  @MinLength(4, { message: "new_password length can not less than 4 character" })
  @MaxLength(6, { message: "new_password length can not greater than 6 character" })
  @Matches(/^[a-zA-Z0-9]\S*$/, {
    message: "new_password not contain any space ",
  })
  @IsNotEmpty()
  @IsString()
  @Type(() => String)
  new_password!: string;
}
