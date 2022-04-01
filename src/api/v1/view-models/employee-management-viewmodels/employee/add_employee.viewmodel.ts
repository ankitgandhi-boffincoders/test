import { Ref } from "@typegoose/typegoose";
import { Expose, Type } from "class-transformer";
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsDate,
  IsDefined,
  IsEmail,
  IsEnum, IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength
} from "class-validator";
import mongoose from "mongoose";
import { ERolevalues } from "../../../models/employee-management-models/employee.model";
import { Organization } from "../../../models/employee-management-models/organization.model";
import { Profile } from "../../../models/employee-management-models/profile.model";

export class AddEmployeeAccountViewmodel {
  @Expose()
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @Type(() => String)
  fullname!: string;

  @IsOptional()
  @Expose()
  @IsDefined()
  @MinLength(4, { message: "password length can not less than 4 character" })
  @MaxLength(6, { message: "password length can not greater than 6 character" })
  @Matches(/^[a-zA-Z0-9]\S*$/, {
    message: "password not contain any space ",
  })
  @IsNotEmpty()
  @IsString()
  @Type(() => String)
  password?: string;

  @Expose()
  @Type(() => String)
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  email!: string;

  @Expose()
  @IsString()
  @IsEmail()
  @IsDefined()
  @IsNotEmpty()
  @Type(() => String)
  emp_personal_email!: string;

  @Expose()
  @IsDefined()
  @IsNotEmpty()
  @IsBoolean()
  @Type(() => Boolean)
  is_deleted!: boolean;

  @Expose()
  @IsDefined()
  @IsNotEmpty()
  @ArrayNotEmpty()
  @IsArray()
  @IsEnum(ERolevalues, {
    each: true,
    message:
      "role must be from one of the following superadmin,manager,employee,hr",
  })
  @Type(() => String)
  roles!: string[];

  @Expose()
  @IsDefined()
  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty()
  @IsMongoId({ each: true })
  manager!: string[];

  @Expose()
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @Type(() => String)
  image!: string;

  @IsOptional()
  @Expose()
  @IsNumber()
  @IsDefined()
  @IsNotEmpty()
  salary!: number;

  @Expose()
  @IsDefined()
  @IsNotEmpty()
  @IsMongoId()
  @Type(() => mongoose.Types.ObjectId)
  designation!: Ref<Profile>;

  @Expose()
  @IsMongoId()
  @IsDefined()
  @IsNotEmpty()
  @Type(() => mongoose.Types.ObjectId)
  organization_id!: Ref<Organization>;

  @Expose()
  //@IsDefined()
  @IsNotEmpty()
  @IsString()
  @Type(() => String)
  bank_acc_no!: string;

  @Expose()
  //@IsDefined()
  @IsNotEmpty()
  @IsString()
  @Type(() => String)
  empId!: string;

  @Expose()
  //@IsDefined()
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  date_of_joining!: Date;

  @Expose()
  //@IsDefined()
  @IsNotEmpty()
  @IsString()
  @Type(() => String)
  esi_no!: string;

  @Expose()
  //@IsDefined()
  @IsNotEmpty()
  @IsString()
  @Type(() => String)
  uan!: string;
  @Expose()
  //@IsDefined()
  @IsNotEmpty()
  @IsString()
  @Type(() => String)
  pf_no!: string;

  @Expose()
  //@IsDefined()
  @IsNotEmpty()
  @IsString()
  @Type(() => String)
  department!: string;

  @Expose()
  //@IsDefined()
  @IsNotEmpty()
  @IsString()
  @Type(() => String)
  bank_name!: string;
}
