import { Expose, Type } from "class-transformer";
import {
  IsDefined, IsNotEmpty,
  IsString,
  Matches
} from "class-validator";

export class LoginViewmodel {
  @Expose()
  @IsDefined()
  @Matches(/^[a-zA-Z0-9]/, {
    message:
      "password not contain any space and will be allowed specified special characters(!#@=()_$+-)",
  })
  @IsNotEmpty()
  @IsString()
  @Type(() => String)
  password!: string;

  @Expose()
  @Type(() => String)
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  email!: string;
}
