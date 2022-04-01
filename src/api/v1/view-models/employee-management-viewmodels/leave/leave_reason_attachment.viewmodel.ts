import { Ref } from "@typegoose/typegoose";
import { Expose } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsDefined, IsMongoId, IsNotEmpty, IsString } from "class-validator";
import { Employees } from "../../../models/employee-management-models/employee.model";

export class AddLeaveReasonAttachmentViewmodel {
  @Expose()
  @IsMongoId()
  @IsDefined()
  @IsNotEmpty()
  leave_id!: Ref<Employees>;

  @Expose()
  @IsDefined()
  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({each:true})
  //@Type(() => String[])
  attachment!: string[];
}
