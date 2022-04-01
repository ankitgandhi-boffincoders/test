import { Expose } from "class-transformer";
import { IsDefined, IsMongoId, IsNotEmpty } from "class-validator";

export class DeleteProfileViewmodel {
  @Expose()
  @IsMongoId()
  @IsDefined()
  @IsNotEmpty()
  _id!: string;
}
