import { Expose } from "class-transformer";
import {
    IsDefined,
    IsNotEmpty, IsString
} from "class-validator";

export class GetInventoryFormFeildsViewmodel {
  @Expose()
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  key!: string;

}
