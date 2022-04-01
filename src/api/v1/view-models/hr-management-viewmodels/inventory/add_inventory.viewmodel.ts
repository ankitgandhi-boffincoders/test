import { Expose } from "class-transformer";
import {
    IsBoolean,
    IsDefined,
    IsNotEmpty,
    IsOptional,
    IsString
} from "class-validator";

class InventoryObjectPropertiesViewmodel {
  @Expose()
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  title!: string;

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
export class AddInventoryViewmodel {
  @Expose()
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  key!: string;

  @Expose()
  feilds!: any[];

  //   @Expose()
  //   feilds!: InventoryObjectPropertiesViewmodel;

  //   @Expose()
  //   @IsDefined()
  //   @IsNotEmpty()
  //   @IsArray()
  //   @ArrayNotEmpty()
  //   @ValidateNested({ each: true })
  //   @Type(() => InventoryObjectPropertiesViewmodel)
  //   feilds_array!: InventoryObjectPropertiesViewmodel[];
}
