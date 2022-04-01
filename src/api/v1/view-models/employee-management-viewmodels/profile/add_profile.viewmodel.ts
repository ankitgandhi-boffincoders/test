import { Expose } from "class-transformer";
import { IsDefined, IsNotEmpty, IsString } from "class-validator";

export class AddProfileViewmodel {
  @Expose()
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  name!: string;
}
