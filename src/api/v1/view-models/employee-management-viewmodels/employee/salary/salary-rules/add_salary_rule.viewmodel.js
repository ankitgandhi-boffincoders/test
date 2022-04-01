"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.ConditionObjViewmodel = exports.AddSalaryRuleViewmodel = void 0;
var class_transformer_1 = require("class-transformer");
var class_validator_1 = require("class-validator");
var salary_rules_model_1 = require("../../../../../models/employee-management-models/salary_rules.model");
var AddSalaryRuleViewmodel = /** @class */ (function () {
    function AddSalaryRuleViewmodel() {
    }
    __decorate([
        (0, class_transformer_1.Expose)(),
        (0, class_validator_1.IsString)(),
        (0, class_validator_1.IsDefined)(),
        (0, class_validator_1.IsNotEmpty)()
    ], AddSalaryRuleViewmodel.prototype, "rule_name");
    __decorate([
        (0, class_transformer_1.Expose)(),
        (0, class_validator_1.IsString)(),
        (0, class_validator_1.IsDefined)(),
        (0, class_validator_1.IsNotEmpty)(),
        (0, class_validator_1.IsEnum)(salary_rules_model_1.EDependsUponValue, {
            message: "depends_upon value must be from one of them i.e salary,employee_count"
        })
    ], AddSalaryRuleViewmodel.prototype, "depends_upon");
    __decorate([
        (0, class_transformer_1.Expose)(),
        (0, class_validator_1.IsBoolean)(),
        (0, class_validator_1.IsDefined)(),
        (0, class_validator_1.IsNotEmpty)()
    ], AddSalaryRuleViewmodel.prototype, "is_added");
    __decorate([
        (0, class_transformer_1.Expose)(),
        (0, class_validator_1.IsNumber)(),
        (0, class_validator_1.IsDefined)(),
        (0, class_validator_1.IsNotEmpty)()
    ], AddSalaryRuleViewmodel.prototype, "value");
    __decorate([
        (0, class_transformer_1.Expose)(),
        (0, class_validator_1.IsArray)(),
        (0, class_validator_1.ArrayNotEmpty)(),
        (0, class_validator_1.IsDefined)(),
        (0, class_validator_1.IsNotEmpty)({ each: true }),
        (0, class_validator_1.ValidateNested)({ each: true }),
        (0, class_transformer_1.Type)(function () { return ConditionObjViewmodel; })
    ], AddSalaryRuleViewmodel.prototype, "condition_array");
    return AddSalaryRuleViewmodel;
}());
exports.AddSalaryRuleViewmodel = AddSalaryRuleViewmodel;
var ConditionObjViewmodel = /** @class */ (function () {
    function ConditionObjViewmodel() {
    }
    __decorate([
        (0, class_transformer_1.Expose)(),
        (0, class_validator_1.IsString)(),
        (0, class_validator_1.IsDefined)(),
        (0, class_validator_1.IsNotEmpty)(),
        (0, class_validator_1.IsEnum)(salary_rules_model_1.EConditionValue, {
            message: "condition_name value must be from one of them i.e less_than,equal_to,greater_than_equal_to,greater_than,less_than_equal_to,not_equal_to"
        })
    ], ConditionObjViewmodel.prototype, "condition_name");
    __decorate([
        (0, class_transformer_1.Expose)(),
        (0, class_validator_1.IsNumber)(),
        (0, class_validator_1.IsDefined)(),
        (0, class_validator_1.IsNotEmpty)()
    ], ConditionObjViewmodel.prototype, "condition_value");
    __decorate([
        (0, class_validator_1.IsOptional)(),
        (0, class_transformer_1.Expose)(),
        (0, class_validator_1.IsString)(),
        (0, class_validator_1.IsDefined)(),
        (0, class_validator_1.IsNotEmpty)(),
        (0, class_validator_1.IsEnum)(salary_rules_model_1.EOperandValue, {
            message: "operand value must be from one of them i.e ||,&& "
        })
    ], ConditionObjViewmodel.prototype, "operand");
    return ConditionObjViewmodel;
}());
exports.ConditionObjViewmodel = ConditionObjViewmodel;
