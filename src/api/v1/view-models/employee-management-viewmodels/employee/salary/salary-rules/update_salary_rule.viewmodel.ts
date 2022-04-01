import { Expose, Type } from "class-transformer";
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsDefined,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString, ValidateNested
} from "class-validator";
import { EDependsUponValue } from "../../../../../models/employee-management-models/salary_rules.model";
import { ConditionObjViewmodel } from "./add_salary_rule.viewmodel";

export class UpdateSalaryRuleViewmodel {
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
  rule_name?: string;

  @IsOptional()
  @Expose()
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  @IsEnum(EDependsUponValue, {
    message:
      "depends_upon value must be from one of them i.e salary,employee_count",
  })
  depends_upon?: EDependsUponValue;

  @IsOptional()
  @Expose()
  @IsBoolean()
  @IsDefined()
  @IsNotEmpty()
  is_added?: boolean;

  @IsOptional()
  @Expose()
  @IsNumber()
  @IsDefined()
  @IsNotEmpty()
  value?: number;

  @IsOptional()
  @Expose()
  @IsArray()
  @ArrayNotEmpty()
  @IsDefined()
  @IsNotEmpty({ each: true })
  @ValidateNested({ each: true })
  @Type(() => ConditionObjViewmodel)
  condition_array?: ConditionObjViewmodel[];
}
