import { Ref } from "@typegoose/typegoose";
import { Expose, Type } from "class-transformer";
import {
  IsDefined,
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsString
} from "class-validator";
import mongoose from "mongoose";
import { Organization } from "../../../models/employee-management-models/organization.model";

export class AddApplicantViewmodel {
  @Expose()
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  name!: string;

  @Expose()
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  company_name!: string;

  @Expose()
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @Expose()
  @IsMongoId()
  @IsDefined()
  @IsNotEmpty()
  @Type(() => mongoose.Types.ObjectId)
  organization_id: Ref<Organization>;

  @Expose()
  @IsNumber()
  @IsDefined()
  @IsNotEmpty()
  @Type(() => Number)
  salary!: number;

  @Expose()
  @IsNumber()
  @IsDefined()
  @IsNotEmpty()
  @Type(() => Number)
  expected_salary!: number;

  @Expose()
  @IsNumber()
  @IsDefined()
  @IsNotEmpty()
  @Type(() => Number)
  mobile_no!: number;

  @Expose()
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  cv_attachment!: string;

  @Expose()
  @IsMongoId()
  @IsDefined()
  @IsNotEmpty()
  designation!: string;

  @Expose()
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  rejection_reason!: string;

  @Expose()
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  leave_last_company_reason!: string;

  @Expose()
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  experience!: string;

  @Expose()
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  linkdin_profile_url!: string;
}
