import { Expose } from "class-transformer";
import {
  IsDefined,
  IsMongoId,
  IsNotEmpty
} from "class-validator";

export class GetAllDepartmentListViewmodel {
  @Expose()
  @IsMongoId()
  @IsDefined()
  @IsNotEmpty()
  organization_id!: string;

}
