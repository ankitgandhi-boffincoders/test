import { Expose } from "class-transformer";
import {
  IsDefined,
  IsMongoId,
  IsNotEmpty
} from "class-validator";

export class GetAllManagerListViewmodel {
  
  @Expose()
  @IsMongoId()
  @IsDefined()
  @IsNotEmpty()
  organization_id!: string;//Ref<Organization>;


  
}
