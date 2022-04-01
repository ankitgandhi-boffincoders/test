import { Expose, Type } from "class-transformer";
import { IsDefined, IsMongoId, IsNotEmpty } from 'class-validator';

export class GetAllFeedbackListViewmodel {
  @Expose()
  @IsMongoId()
  @IsDefined()
  @IsNotEmpty()
  @Type(()=>String)
  organization_id!: string;

}
