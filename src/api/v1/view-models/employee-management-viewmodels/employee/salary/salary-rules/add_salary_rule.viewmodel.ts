import { Expose, Type } from "class-transformer";
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsDefined,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString, ValidateNested
} from "class-validator";
import {
  EConditionValue,
  EDependsUponValue,
  EOperandValue
} from "../../../../../models/employee-management-models/salary_rules.model";

export class AddSalaryRuleViewmodel {
  @Expose()
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  rule_name!: string;

  @Expose()
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  @IsEnum(EDependsUponValue, {
    message:
      "depends_upon value must be from one of them i.e salary,employee_count",
  })
  depends_upon!: EDependsUponValue;

  @Expose()
  @IsBoolean()
  @IsDefined()
  @IsNotEmpty()
  is_added!: boolean;

  @Expose()
  @IsNumber()
  @IsDefined()
  @IsNotEmpty()
  value!: number;

  @Expose()
  @IsArray()
  @ArrayNotEmpty()
  @IsDefined()
  @IsNotEmpty({ each: true })
  @ValidateNested({ each: true })
  @Type(() => ConditionObjViewmodel)
  condition_array!: ConditionObjViewmodel[];
}

export class ConditionObjViewmodel {
  @Expose()
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  @IsEnum(EConditionValue, {
    message:
      "condition_name value must be from one of them i.e less_than,equal_to,greater_than_equal_to,greater_than,less_than_equal_to,not_equal_to",
  })
  condition_name!: EConditionValue;

  @Expose()
  @IsNumber()
  @IsDefined()
  @IsNotEmpty()
  condition_value!: number;

  @IsOptional()
  @Expose()
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  @IsEnum(EOperandValue, {
    message: "operand value must be from one of them i.e ||,&& ",
  })
  operand?: EOperandValue;
}
