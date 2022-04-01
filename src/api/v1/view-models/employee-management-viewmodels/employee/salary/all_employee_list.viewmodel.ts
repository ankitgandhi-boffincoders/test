import { Ref } from "@typegoose/typegoose";
import { Expose } from "class-transformer";
import {
  IsDefined,
  IsMongoId,
  IsNotEmpty,
  IsOptional
} from "class-validator";
import { Organization } from '../../../../models/employee-management-models/organization.model';

export class GetAllEmployeeListViewmodel {
  @IsOptional()
  @Expose()
  @IsMongoId()
  @IsDefined()
  @IsNotEmpty()
  organization_id?: Ref<Organization>;


  
}
