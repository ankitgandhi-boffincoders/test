import { Expose, Type } from "class-transformer";
import {
    IsDefined, IsMongoId,
    IsNotEmpty
} from "class-validator";

export class DeleteOrganizationViewmodel {
  @Expose()
  @IsDefined()
  @IsNotEmpty()
  @IsMongoId()
  @Type(() => String)
  _id!: string;

}
