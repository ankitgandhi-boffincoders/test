import { Ref } from "@typegoose/typegoose";
import { Expose, Type } from "class-transformer";
import {
  IsDefined, IsMongoId,
  IsNotEmpty, IsString
} from "class-validator";
import mongoose from "mongoose";
import { Organization } from "../../../models/employee-management-models/organization.model";

export class AddDepartmentViewmodel {
  @Expose()
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  name!: string;

  @Expose()
  @IsMongoId()
  @IsDefined()
  @IsNotEmpty()
  @Type(() => mongoose.Types.ObjectId)
  organization_id: Ref<Organization>;
}
