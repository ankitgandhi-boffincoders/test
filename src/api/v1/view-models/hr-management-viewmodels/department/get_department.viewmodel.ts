import { Expose } from "class-transformer";
import { IsDefined, IsMongoId, IsNotEmpty } from "class-validator";

export class GetDepartmentDetailsViewmodel {
  @Expose()
  @IsMongoId()
  @IsDefined()
  @IsNotEmpty()
  _id!: string;
}
