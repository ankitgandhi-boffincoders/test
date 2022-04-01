"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.UpdateSalaryRuleViewmodel = void 0;
var class_transformer_1 = require("class-transformer");
var class_validator_1 = require("class-validator");
var salary_rules_model_1 = require("../../../../../models/employee-management-models/salary_rules.model");
var add_salary_rule_viewmodel_1 = require("./add_salary_rule.viewmodel");
var UpdateSalaryRuleViewmodel = /** @class */ (function () {
    function UpdateSalaryRuleViewmodel() {
    }
    __decorate([
        (0, class_transformer_1.Expose)(),
        (0, class_validator_1.IsMongoId)(),
        (0, class_validator_1.IsDefined)(),
        (0, class_validator_1.IsNotEmpty)()
    ], UpdateSalaryRuleViewmodel.prototype, "_id");
    __decorate([
        (0, class_validator_1.IsOptional)(),
        (0, class_transformer_1.Expose)(),
        (0, class_validator_1.IsString)(),
        (0, class_validator_1.IsDefined)(),
        (0, class_validator_1.IsNotEmpty)()
    ], UpdateSalaryRuleViewmodel.prototype, "rule_name");
    __decorate([
        (0, class_validator_1.IsOptional)(),
        (0, class_transformer_1.Expose)(),
        (0, class_validator_1.IsString)(),
        (0, class_validator_1.IsDefined)(),
        (0, class_validator_1.IsNotEmpty)(),
        (0, class_validator_1.IsEnum)(salary_rules_model_1.EDependsUponValue, {
            message: "depends_upon value must be from one of them i.e salary,employee_count"
        })
    ], UpdateSalaryRuleViewmodel.prototype, "depends_upon");
    __decorate([
        (0, class_validator_1.IsOptional)(),
        (0, class_transformer_1.Expose)(),
        (0, class_validator_1.IsBoolean)(),
        (0, class_validator_1.IsDefined)(),
        (0, class_validator_1.IsNotEmpty)()
    ], UpdateSalaryRuleViewmodel.prototype, "is_added");
    __decorate([
        (0, class_validator_1.IsOptional)(),
        (0, class_transformer_1.Expose)(),
        (0, class_validator_1.IsNumber)(),
        (0, class_validator_1.IsDefined)(),
        (0, class_validator_1.IsNotEmpty)()
    ], UpdateSalaryRuleViewmodel.prototype, "value");
    __decorate([
        (0, class_validator_1.IsOptional)(),
        (0, class_transformer_1.Expose)(),
        (0, class_validator_1.IsArray)(),
        (0, class_validator_1.ArrayNotEmpty)(),
        (0, class_validator_1.IsDefined)(),
        (0, class_validator_1.IsNotEmpty)({ each: true }),
        (0, class_validator_1.ValidateNested)({ each: true }),
        (0, class_transformer_1.Type)(function () { return add_salary_rule_viewmodel_1.ConditionObjViewmodel; })
    ], UpdateSalaryRuleViewmodel.prototype, "condition_array");
    return UpdateSalaryRuleViewmodel;
}());
exports.UpdateSalaryRuleViewmodel = UpdateSalaryRuleViewmodel;
