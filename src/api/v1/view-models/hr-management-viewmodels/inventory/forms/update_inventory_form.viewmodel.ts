import { Expose, Type } from "class-transformer";
import {
  ArrayNotEmpty,
  IsArray,
  IsDefined,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  ValidateNested
} from "class-validator";
import { InventoryObjectPropertiesViewmodel } from "./add_inventory_form.viewmodel";

export class UpdateInventoryFormViewmodel {
  @Expose()
  @IsMongoId()
  @IsDefined()
  @IsNotEmpty()
  _id!: string;

  @Expose()
  key!: string;

  @IsOptional()
  @Expose()
  @IsDefined()
  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => InventoryObjectPropertiesViewmodel)
  feilds?: InventoryObjectPropertiesViewmodel[];
}

///
// class InventoryObjectPropertiesViewmodel {
//   @IsOptional()
//   @Expose()
//   @IsString()
//   @IsDefined()
//   @IsNotEmpty()
//   title?: string;

//   @IsOptional()
//   @Expose()
//   @IsString()
//   @IsDefined()
//   @IsNotEmpty()
//   type?: string;

//   @IsOptional()
//   @Expose()
//   @IsBoolean()
//   @IsDefined()
//   @IsNotEmpty()
//   is_required?: boolean;

//   @IsOptional()
//   @Expose()
//   @IsString()
//   @IsDefined()
//   @IsNotEmpty()
//   regex?: string;

//   @IsOptional()
//   @Expose()
//   @IsString()
//   @IsDefined()
//   @IsNotEmpty()
//   regex_error?: string;

//   @IsOptional()
//   @Expose()
//   @IsString()
//   @IsDefined()
//   @IsNotEmpty()
//   is_required_error?: string;
// }
// export class UpdateInventoryFormViewmodel {
//   @Expose()
//   @IsMongoId()
//   @IsDefined()
//   @IsNotEmpty()
//   _id!: string;

//   @Expose()
//   key!: string;

//   @IsOptional()
//   @Expose()
//   @IsDefined()
//   @IsNotEmpty()
//   // @Type(() => InventoryObjectPropertiesViewmodel)
//   feilds!: InventoryObjectPropertiesViewmodel;

//   //   @IsOptional()
//   //   @Expose()
//   //   @IsDefined()
//   //   @IsNotEmpty()
//   //   @IsArray()
//   //   @ArrayNotEmpty()
//   //   @ValidateNested({ each: true })
//   //   @Type(() => InventoryObjectPropertiesViewmodel)
//   //   feilds_array!: InventoryObjectPropertiesViewmodel[];
// }
