import { Expose, Type } from "class-transformer";
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsDefined,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested
} from "class-validator";

export class InventoryObjectPropertiesViewmodel {
  @Expose()
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  title!: string;

  @Expose()
  feild_id!:string;
  
  @Expose()
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  type!: string;

  @Expose()
  @IsBoolean()
  @IsDefined()
  @IsNotEmpty()
  is_required!: boolean;

  @IsOptional()
  @Expose()
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  regex?: string;

  @IsOptional()
  @Expose()
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  regex_error?: string;

  @IsOptional()
  @Expose()
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  is_required_error?: string;
}
export class AddInventoryFormViewmodel {
  @Expose()
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  key!: string;
  
  
  @Expose()
  @IsDefined()
  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => InventoryObjectPropertiesViewmodel)
  feilds!: InventoryObjectPropertiesViewmodel[];
}
