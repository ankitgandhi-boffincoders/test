import { Expose } from "class-transformer";
import {
    IsDefined,
    IsNotEmpty, IsString
} from "class-validator";


export class GetInventoryViewmodel {
  @Expose()
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  key!: string;

  
}
