import { NextFunction, Request, Response } from "express";
import HttpStatus from "http-status-codes";
import Utility, { ValidationResult } from "../../../common/common-methods";
import {
  AddEmployeeAccountViewmodel,
  ForgotPasswordViewmodel,
  GetEmployeeDetailsViewmodel,
  LoginViewmodel,
  ResetForgotPasswordViewmodel,
  ResetPasswordViewModel,
  UpdateEmployeeAccountViewmodel
} from "../../../view-models/employee-management-viewmodels/employee/index";
import { GenerateAllEmployeeSalarySlipViewmodel } from "../../../view-models/employee-management-viewmodels/employee/salary/generate_all_employee_salary_slip.viewmodel";
import {
  CalculateEmployeeSalaryViewmodel,
  GenerateEmployeeSalarySlipViewmodel, GetAllEmployeeListViewmodel,
  GetAllManagerListViewmodel,
  GetEmployeeSalaryIncremetListViewmodel,
  UpdateEmployeeSalaryViewmodel
} from "../../../view-models/employee-management-viewmodels/employee/salary/index";
import {
  AddSalaryRuleViewmodel,
  DeleteSalaryRuleViewmodel,
  UpdateSalaryRuleViewmodel
} from "../../../view-models/employee-management-viewmodels/employee/salary/salary-rules/index";
import employeeService from "./employee.service";
class Employee_Controller {
  //Add Employee Account
  public addEmployee = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let conversionResult: ValidationResult = await Utility.ValidateAndConvert(
        AddEmployeeAccountViewmodel,
        req.body
      );

      if (conversionResult.error && conversionResult.error.length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          status_code: HttpStatus.BAD_REQUEST,
          success: false,
          errors: conversionResult.error,
        });
      } else {
        let model: AddEmployeeAccountViewmodel =
          conversionResult.data as AddEmployeeAccountViewmodel;

        let employeeResult = await employeeService.addEmployee(req, model);
        if (employeeResult && employeeResult.status_code === HttpStatus.OK)
          return res.status(employeeResult.status_code).json({
            status_code: employeeResult.status_code,
            success: true,
            data: employeeResult.data,
          });
        else
          return res.status(employeeResult.status_code).json({
            status_code: employeeResult.status_code,
            success: false,
            errors: [employeeResult.data],
          });
      }
    } catch (error) {
      next(error);
    }
  };
  //Update Employee Account
  public updateEmployee = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let conversionResult: ValidationResult = await Utility.ValidateAndConvert(
        UpdateEmployeeAccountViewmodel,
        req.body
      );

      if (conversionResult.error && conversionResult.error.length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          status_code: HttpStatus.BAD_REQUEST,
          success: false,
          errors: conversionResult.error,
        });
      } else {
        let model: UpdateEmployeeAccountViewmodel =
          conversionResult.data as UpdateEmployeeAccountViewmodel;

        let employeeResult = await employeeService.updateEmployee(req, model);
        if (employeeResult && employeeResult.status_code === HttpStatus.OK)
          return res.status(employeeResult.status_code).json({
            status_code: employeeResult.status_code,
            success: true,
            data: employeeResult.data,
          });
        else
          return res.status(employeeResult.status_code).json({
            status_code: employeeResult.status_code,
            success: false,
            errors: [employeeResult.data],
          });
      }
    } catch (error) {
      next(error);
    }
  };

  public getEmployeeDetails = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let conversionResult: ValidationResult = await Utility.ValidateAndConvert(
        GetEmployeeDetailsViewmodel,
        JSON.parse(`{"_id":"${req.params._id}"}`)
      );

      if (conversionResult.error && conversionResult.error.length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          status_code: HttpStatus.BAD_REQUEST,
          success: false,
          errors: conversionResult.error,
        });
      } else {
        let employeeResult = await employeeService.getEmployeeDetails(req);
        if (employeeResult && employeeResult.status_code === HttpStatus.OK)
          return res.status(employeeResult.status_code).json({
            status_code: employeeResult.status_code,
            success: true,
            data: employeeResult.data,
          });
        else
          return res.status(employeeResult.status_code).json({
            status_code: employeeResult.status_code,
            success: false,
            errors: [employeeResult.data],
          });
      }
    } catch (error) {
      next(error);
    }
  };

  public loginEmployeeDetails = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
     
        let employeeResult = await employeeService.loginEmployeeDetails(req);
        if (employeeResult && employeeResult.status_code === HttpStatus.OK)
          return res.status(employeeResult.status_code).json({
            status_code: employeeResult.status_code,
            success: true,
            data: employeeResult.data,
          });
        else
          return res.status(employeeResult.status_code).json({
            status_code: employeeResult.status_code,
            success: false,
            errors: [employeeResult.data],
          });
      
    } catch (error) {
      next(error);
    }
  };
  //LOGIN
  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let conversionResult: ValidationResult = await Utility.ValidateAndConvert(
        LoginViewmodel,
        req.body
      );

      if (conversionResult.error && conversionResult.error.length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          status_code: HttpStatus.BAD_REQUEST,
          success: false,
          errors: conversionResult.error,
        });
      } else {
        let model: LoginViewmodel = conversionResult.data as LoginViewmodel;

        let loginResult = await employeeService.login(req, model);
        if (loginResult && loginResult.status_code === HttpStatus.OK)
          return res.status(loginResult.status_code).json({
            status_code: loginResult.status_code,
            success: true,
            data: loginResult.data,
          });
        else
          return res.status(loginResult.status_code).json({
            status_code: loginResult.status_code,
           
            success: false,
            errors: [loginResult.data],
          });
      }
    } catch (error) {
      next(error);
    }
  };
  forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let conversionResult: ValidationResult = await Utility.ValidateAndConvert(
        ForgotPasswordViewmodel,
        req.body
      );

      if (conversionResult.error && conversionResult.error.length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          status_code: HttpStatus.BAD_REQUEST,
          success: false,
          errors: conversionResult.error,
        });
      } else {
        let model: ForgotPasswordViewmodel =
          conversionResult.data as ForgotPasswordViewmodel;

        let loginResult = await employeeService.forgotPassword(req, model);
        if (loginResult && loginResult.status_code === HttpStatus.OK)
          return res.status(loginResult.status_code).json({
            status_code: loginResult.status_code,
            success: true,
            data: loginResult.data,
          });
        else
          return res.status(loginResult.status_code).json({
            status_code: loginResult.status_code,
          
            success: false,
            errors: [loginResult.data],
          });
      }
    } catch (error) {
      next(error);
    }
  };

  reset_forgot_password = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let conversionResult: ValidationResult = await Utility.ValidateAndConvert(
        ResetForgotPasswordViewmodel,
        req.body
      );

      if (conversionResult.error && conversionResult.error.length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          status_code: HttpStatus.BAD_REQUEST,
          success: false,
          errors: conversionResult.error,
        });
      } else {
        let model: ResetForgotPasswordViewmodel =
          conversionResult.data as ResetForgotPasswordViewmodel;

        let loginResult = await employeeService.reset_forgot_password(model);
        if (loginResult && loginResult.status_code === HttpStatus.OK)
          return res.status(loginResult.status_code).json({
            status_code: loginResult.status_code,
            success: true,
            data: loginResult.data,
          });
        else
          return res.status(loginResult.status_code).json({
            status_code: loginResult.status_code,
       
            success: false,
            errors: [loginResult.data],
          });
      }
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let conversionResult: ValidationResult = await Utility.ValidateAndConvert(
        ResetPasswordViewModel,
        req.body
      );

      if (conversionResult.error && conversionResult.error.length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          status_code: HttpStatus.BAD_REQUEST,
          success: false,
          errors: conversionResult.error,
        });
      } else {
        let model: ResetPasswordViewModel =
          conversionResult.data as ResetPasswordViewModel;

        let loginResult = await employeeService.resetPassword(req, model);
        if (loginResult && loginResult.status_code === HttpStatus.OK)
          return res.status(loginResult.status_code).json({
            status_code: loginResult.status_code,
            success: true,
            data: loginResult.data,
          });
        else
          return res.status(loginResult.status_code).json({
            status_code: loginResult.status_code,
            
            success: false,
            errors: [loginResult.data],
          });
      }
    } catch (error) {
      next(error);
    }
  };
  
  allEmployeeList = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let conversionResult: ValidationResult = await Utility.ValidateAndConvert(
        GetAllEmployeeListViewmodel,
        JSON.parse(`{"organization_id?":"${req.params?.organization_id}"}`)
      );

      if (conversionResult.error && conversionResult.error.length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          status_code: HttpStatus.BAD_REQUEST,
          success: false,
          errors: conversionResult.error,
        });
      } else {
        let listResult = await employeeService.allEmployeeList(req);
        if (listResult && listResult.status_code === HttpStatus.OK)
          return res.status(listResult.status_code).json({
            status_code: listResult.status_code,
            success: true,
            data: listResult.data,
          });
        else
          return res.status(listResult.status_code).json({
            status_code: listResult.status_code,
            success: false,
            errors: [listResult.data],
          });
      }
    } catch (error) {
      next(error);
    }
  };
  
  allManagerList = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let conversionResult: ValidationResult = await Utility.ValidateAndConvert(
        GetAllManagerListViewmodel,
        JSON.parse(`{"organization_id":"${req.params.organization_id}"}`)
      );

      if (conversionResult.error && conversionResult.error.length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          status_code: HttpStatus.BAD_REQUEST,
          success: false,
          errors: conversionResult.error,
        });
      } else {
        let model:GetAllManagerListViewmodel=conversionResult.data as GetAllManagerListViewmodel
        let listResult = await employeeService.allManagerList(req,model);
        if (listResult && listResult.status_code === HttpStatus.OK)
          return res.status(listResult.status_code).json({
            status_code: listResult.status_code,
            success: true,
            data: listResult.data,
          });
        else
          return res.status(listResult.status_code).json({
            status_code: listResult.status_code,
            success: false,
            errors: [listResult.data],
          });
      }
    } catch (error) {
      next(error);
    }
  };

//List Employee
  allEmployeeDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let conversionResult: ValidationResult = await Utility.ValidateAndConvert(
        GetAllEmployeeListViewmodel,
        JSON.parse(`{"organization_id?":"${req.params?.organization_id}"}`)
      );

      if (conversionResult.error && conversionResult.error.length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          status_code: HttpStatus.BAD_REQUEST,
          success: false,
          errors: conversionResult.error,
        });
      } else {
        let listResult = await employeeService.allEmployeeDetails(req);
        if (listResult && listResult.status_code === HttpStatus.OK)
          return res.status(listResult.status_code).json({
            status_code: listResult.status_code,
            success: true,
            data: listResult.data,
          });
        else
          return res.status(listResult.status_code).json({
            status_code: listResult.status_code,
            success: false,
            errors: [listResult.data],
          });
      }
    } catch (error) {
      next(error);
    }
  };
  //staff list under staff
  staffListUnderStaff = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let listResult = await employeeService.staffListUnderStaff(req);
      if (listResult && listResult.status_code === HttpStatus.OK)
        return res.status(listResult.status_code).json({
          status_code: listResult.status_code,
          success: true,
          data: listResult.data,
        });
      else
        return res.status(listResult.status_code).json({
          status_code: listResult.status_code,
          success: false,
          errors: [listResult.data],
        });
    } catch (error) {
      next(error);
    }
  };
  //Roles
  //List Of All roles
  allRoleList = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let roleListResult = await employeeService.allRoleList(req);
      if (roleListResult && roleListResult.status_code === HttpStatus.OK)
        return res.status(roleListResult.status_code).json({
          status_code: roleListResult.status_code,
          success: true,
          data: roleListResult.data,
        });
      else
        return res.status(roleListResult.status_code).json({
          status_code: roleListResult.status_code,
          success: false,
          errors: [roleListResult.data],
        });
    } catch (error) {
      next(error);
    }
  };
  
  allRoleCollection = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let roleListResult = await employeeService.allRoleCollection();
      if (roleListResult && roleListResult.status_code === HttpStatus.OK)
        return res.status(roleListResult.status_code).json({
          status_code: roleListResult.status_code,
          success: true,
          data: roleListResult.data,
        });
      else
        return res.status(roleListResult.status_code).json({
          status_code: roleListResult.status_code,
          success: false,
          errors: [roleListResult.data],
        });
    } catch (error) {
      next(error);
    }
  };
  //salary

  //Update Employee salary
  public updateEmployeeSalary = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let conversionResult: ValidationResult = await Utility.ValidateAndConvert(
        UpdateEmployeeSalaryViewmodel,
        req.body
      );

      if (conversionResult.error && conversionResult.error.length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          status_code: HttpStatus.BAD_REQUEST,
          success: false,
          errors: conversionResult.error,
        });
      } else {
        let model: UpdateEmployeeSalaryViewmodel =
          conversionResult.data as UpdateEmployeeSalaryViewmodel;

        let salaryResult = await employeeService.updateEmployeeSalary(
          req,
          model
        );
        if (salaryResult && salaryResult.status_code === HttpStatus.OK)
          return res.status(salaryResult.status_code).json({
            status_code: salaryResult.status_code,
            success: true,
          });
        else
          return res.status(salaryResult.status_code).json({
            status_code: salaryResult.status_code,
            success: false,
            errors: [salaryResult.data],
          });
      }
    } catch (error) {
      next(error);
    }
  };
  public getSalaryIncrementHistory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let conversionResult: ValidationResult = await Utility.ValidateAndConvert(
        GetEmployeeSalaryIncremetListViewmodel,
        req.body
      );

      if (conversionResult.error && conversionResult.error.length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          status_code: HttpStatus.BAD_REQUEST,
          success: false,
          errors: conversionResult.error,
        });
      } else {
        let model: GetEmployeeSalaryIncremetListViewmodel =
          conversionResult.data as GetEmployeeSalaryIncremetListViewmodel;

        let salaryHistoryResult =
          await employeeService.getSalaryIncrementHistory(req, model);
        if (
          salaryHistoryResult &&
          salaryHistoryResult.status_code === HttpStatus.OK
        )
          return res.status(salaryHistoryResult.status_code).json({
            status_code: salaryHistoryResult.status_code,
            success: true,
            data: salaryHistoryResult.data,
          });
        else
          return res.status(salaryHistoryResult.status_code).json({
            status_code: salaryHistoryResult.status_code,
            success: false,
            errors: [salaryHistoryResult.data],
          });
      }
    } catch (error) {
      next(error);
    }
  };

  public EmployeeSalaryWithRules = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let conversionResult: ValidationResult = await Utility.ValidateAndConvert(
        CalculateEmployeeSalaryViewmodel,
        req.body
      );

      if (conversionResult.error && conversionResult.error.length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          status_code: HttpStatus.BAD_REQUEST,
          success: false,
          errors: conversionResult.error,
        });
      } else {
        let model: CalculateEmployeeSalaryViewmodel =
          conversionResult.data as CalculateEmployeeSalaryViewmodel;

        let salaryHistoryResult =
          await employeeService.EmployeeSalaryWithRulesNew(req, model);
        if (
          salaryHistoryResult &&
          salaryHistoryResult.status_code === HttpStatus.OK
        )
          return res.status(salaryHistoryResult.status_code).json({
            status_code: salaryHistoryResult.status_code,
            success: true,
            data: salaryHistoryResult.data,
          });
        else
          return res.status(salaryHistoryResult.status_code).json({
            status_code: salaryHistoryResult.status_code,
            success: false,
            errors: [salaryHistoryResult.data],
          });
      }
    } catch (error) {
      next(error);
    }
  };
  public generateEmployeeSalarySlip = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let conversionResult: ValidationResult = await Utility.ValidateAndConvert(
        GenerateEmployeeSalarySlipViewmodel,
        req.body
      );

      if (conversionResult.error && conversionResult.error.length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          status_code: HttpStatus.BAD_REQUEST,
          success: false,
          errors: conversionResult.error,
        });
      } else {
        let model: GenerateEmployeeSalarySlipViewmodel =
          conversionResult.data as GenerateEmployeeSalarySlipViewmodel;

        let salaryHistoryResult =
          await employeeService.generateEmployeeSalarySlip(req, model);
        if (
          salaryHistoryResult &&
          salaryHistoryResult.status_code === HttpStatus.OK
        )
          return res.status(salaryHistoryResult.status_code).json({
            status_code: salaryHistoryResult.status_code,
            success: true,
            data: salaryHistoryResult.data,
          });
        else
          return res.status(salaryHistoryResult.status_code).json({
            status_code: salaryHistoryResult.status_code,
            success: false,
            errors: [salaryHistoryResult.data],
          });
      }
    } catch (error) {
      next(error);
    }
  };

  public MonthlyAllEmployeeSalarySlip = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (req.params.organization_id) {
        let conversionResult: ValidationResult =
          await Utility.ValidateAndConvert(
            GenerateAllEmployeeSalarySlipViewmodel,
            req.body
          );

        if (conversionResult.error && conversionResult.error.length > 0) {
          return res.status(HttpStatus.BAD_REQUEST).send({
            status_code: HttpStatus.BAD_REQUEST,
            success: false,
            errors: conversionResult.error,
          });
        } else {
          let model: GenerateAllEmployeeSalarySlipViewmodel =
            conversionResult.data as GenerateAllEmployeeSalarySlipViewmodel;
          let salaryHistoryResult =
            await employeeService.MonthlyAllEmployeeSalarySlip(req, model);
          if (
            salaryHistoryResult &&
            salaryHistoryResult.status_code === HttpStatus.OK
          )
            return res.status(salaryHistoryResult.status_code).json({
              status_code: salaryHistoryResult.status_code,
              success: true,
              data: salaryHistoryResult.data,
            });
          else
            return res.status(salaryHistoryResult.status_code).json({
              status_code: salaryHistoryResult.status_code,
              success: false,
              errors: [salaryHistoryResult.data],
            });
        }
      }
    } catch (error) {
      next(error);
    }
  };

  //Salary Rules

  public addSalaryRule = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let conversionResult: ValidationResult = await Utility.ValidateAndConvert(
        AddSalaryRuleViewmodel,
        req.body
      );

      if (conversionResult.error && conversionResult.error.length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          status_code: HttpStatus.BAD_REQUEST,
          success: false,
          errors: conversionResult.error,
        });
      } else {
        let model: AddSalaryRuleViewmodel =
          conversionResult.data as AddSalaryRuleViewmodel;

        let salaryRuleResult = await employeeService.addSalaryRule(req, model);
        if (salaryRuleResult && salaryRuleResult.status_code === HttpStatus.OK)
          return res.status(salaryRuleResult.status_code).json({
            status_code: salaryRuleResult.status_code,
            success: true,
            data: salaryRuleResult.data,
          });
        else
          return res.status(salaryRuleResult.status_code).json({
            status_code: salaryRuleResult.status_code,
            success: false,
            errors: [salaryRuleResult.data],
          });
      }
    } catch (error) {
      next(error);
    }
  };

  public deleteSalaryRule = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let conversionResult: ValidationResult = await Utility.ValidateAndConvert(
        DeleteSalaryRuleViewmodel,
        JSON.parse(`{"_id":"${req.params._id}"}`)
      );

      if (conversionResult.error && conversionResult.error.length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          status_code: HttpStatus.BAD_REQUEST,
          success: false,
          errors: conversionResult.error,
        });
      } else {
        let model: DeleteSalaryRuleViewmodel =
          conversionResult.data as DeleteSalaryRuleViewmodel;

        let salaryRuleResult = await employeeService.deleteSalaryRule(req);
        if (salaryRuleResult && salaryRuleResult.status_code === HttpStatus.OK)
          return res.status(salaryRuleResult.status_code).json({
            status_code: salaryRuleResult.status_code,
            success: true,
          });
        else
          return res.status(salaryRuleResult.status_code).json({
            status_code: salaryRuleResult.status_code,
            success: false,
            errors: [salaryRuleResult.data],
          });
      }
    } catch (error) {
      next(error);
    }
  };
  public updateSalaryRule = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let conversionResult: ValidationResult = await Utility.ValidateAndConvert(
        UpdateSalaryRuleViewmodel,
        req.body
      );
      if (conversionResult.error && conversionResult.error.length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          status_code: HttpStatus.BAD_REQUEST,
          success: false,
          errors: conversionResult.error,
        });
      } else {
        let model: UpdateSalaryRuleViewmodel =
          conversionResult.data as UpdateSalaryRuleViewmodel;

        let salaryRuleResult = await employeeService.updateSalaryRule(
          req,
          model
        );
        if (salaryRuleResult && salaryRuleResult.status_code === HttpStatus.OK)
          return res.status(salaryRuleResult.status_code).json({
            status_code: salaryRuleResult.status_code,
            success: true,
          });
        else
          return res.status(salaryRuleResult.status_code).json({
            status_code: salaryRuleResult.status_code,
            success: false,
            errors: [salaryRuleResult.data],
          });
      }
    } catch (error) {
      next(error);
    }
  };
  public allSalaryRuleList = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let salaryRuleListResult = await employeeService.allSalaryRuleList(req);
      if (
        salaryRuleListResult &&
        salaryRuleListResult.status_code === HttpStatus.OK
      )
        return res.status(salaryRuleListResult.status_code).json({
          status_code: salaryRuleListResult.status_code,
          success: true,
          data: salaryRuleListResult.data,
        });
      else
        return res.status(salaryRuleListResult.status_code).json({
          status_code: salaryRuleListResult.status_code,
          success: false,
          errors: [salaryRuleListResult.data],
        });
    } catch (error) {
      next(error);
    }
  };
}
export default new Employee_Controller();
