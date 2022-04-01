import { Ref } from "@typegoose/typegoose";
import { Expose, Type } from "class-transformer";
import {
  IsDefined,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString
} from "class-validator";
import { Organization } from "../../../models/employee-management-models/organization.model";

export class UpdateApplicantViewmodel {
  @Expose()
  @IsMongoId()
  @IsDefined()
  @IsNotEmpty()
  _id!: string;

  @IsOptional()
  @Expose()
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  name?: string;

 
  @Expose()
  
  organization_id: Ref<Organization>;

  @IsOptional()
  @Expose()
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  company_name?: string;

  @IsOptional()
  @Expose()
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  email?: string;

  @IsOptional()
  @Expose()
  @IsNumber()
  @IsDefined()
  @IsNotEmpty()
  @Type(() => Number)
  salary?: number;

  @IsOptional()
  @Expose()
  @IsNumber()
  @IsDefined()
  @IsNotEmpty()
  @Type(() => Number)
  expected_salary?: number;

  @IsOptional()
  @Expose()
  @IsNumber()
  @IsDefined()
  @IsNotEmpty()
  @Type(() => Number)
  mobile_no?: number;

  @IsOptional()
  @Expose()
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  cv_attachment?: string;

  @IsOptional()
  @Expose()
  @IsMongoId()
  @IsDefined()
  @IsNotEmpty()
  designation?: string;

  @IsOptional()
  @Expose()
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  rejection_reason?: string;

  @IsOptional()
  @Expose()
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  leave_last_company_reason?: string;

  @IsOptional()
  @Expose()
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  experience?: string;

  @IsOptional()
  @Expose()
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  linkdin_profile_url?: string;
}
