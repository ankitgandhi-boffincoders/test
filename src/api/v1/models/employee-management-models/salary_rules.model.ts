import { getModelForClass, prop } from "@typegoose/typegoose";
export enum EOperandValue {
  OR = "||",
  AND = "&&",
}
export enum EConditionValue {
  LESSTHAN = "less_than",
  EQUAL = "equal_to",
  GREATERTHANEQUAL = "greater_than_equal_to",
  GREATERTHAN = "greater_than",
  LESSTHANEQUAL = "less_than_equal_to",
  NOTEQUAL = "not_equal_to",
}

export enum EDependsUponValue {
  SALARY = "salary",
  EMPLOYEECOUNT = "employee_count",
}

export class SalaryRulesConditionsObject {
  @prop({ type: String })
  name!: string;

  @prop({ type: Number })
  condition_value!: number;
}
export class ConditionObj {
  @prop({ type: String })
  condition_name!: EConditionValue;

  @prop({ type: Number })
  condition_value!: number;
  @prop({ type: String })
  operand?: EOperandValue;
}
export class SalaryRules {
  @prop({ type: String })
  rule_name!: string;
  @prop({ type: Boolean })
  is_added!: boolean;
  @prop({ type: String })
  depends_upon!: EDependsUponValue;

  @prop({ type: Number })
  value!: number;

  @prop({ _id: false, type: [ConditionObj] })
  condition_array!: ConditionObj[];
}

const Salary_Rules_DB_MODEL = getModelForClass(SalaryRules, {
  schemaOptions: {
    collection: "salary_rules",
  },
});
export default Salary_Rules_DB_MODEL;
