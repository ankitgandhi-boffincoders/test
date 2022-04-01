import { Ref } from "@typegoose/typegoose";
import { Expose } from "class-transformer";
import {
  IsDefined,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Max,
  Min
} from "class-validator";
import { Organization } from '../../../../models/employee-management-models/organization.model';

export class GenerateAllEmployeeSalarySlipViewmodel {
  @IsOptional()
  @Expose()
  @IsMongoId()
  @IsDefined()
  @IsNotEmpty()
  organization_id?: Ref<Organization>;

  @IsOptional()
  @Expose()
  @Min(1)
  @Max(12)
  @IsNumber()
  @IsDefined()
  @IsNotEmpty()
  month!: number;

  
  @IsOptional()
  @Expose()
  @Min(1900)
  @Max(3000)
  @IsNumber()
  @IsDefined()
  @IsNotEmpty()
  year!: number;


  
}
