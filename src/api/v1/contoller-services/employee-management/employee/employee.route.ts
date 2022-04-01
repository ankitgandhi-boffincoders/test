import express from "express";
import passport from "passport";
import EmployeeController from "./employee.controller";

export class Employee_Router {
  public router = express.Router();

  constructor() {
    this.config();
  }

  private config(): void {
    this.router.post(
      "/add",
      passport.authenticate("jwt", { session: false }),

      EmployeeController.addEmployee
    );
    

    //Login &&  Forgot Password
    this.router.post("/login", EmployeeController.login);
    this.router.post("/forgot_password", EmployeeController.forgotPassword);
    this.router.post(
      "/reset_forgot_password",
      EmployeeController.reset_forgot_password
    );

    this.router.put("/reset_password", EmployeeController.resetPassword);
    this.router.put(
      "/update",
      passport.authenticate("jwt", { session: false }),
      EmployeeController.updateEmployee
    );
    this.router.get(
      "/details/:_id",
      passport.authenticate("jwt", { session: false }),
      EmployeeController.getEmployeeDetails
    );
    this.router.get(
      "/login_employee_details",
      passport.authenticate("jwt", { session: false }),
      EmployeeController.loginEmployeeDetails
    );

    this.router.get(
      "/allEmployeeList/:organization_id?",
      passport.authenticate("jwt", { session: false }),
      EmployeeController.allEmployeeList
    );

    this.router.get(
      "/allManagerList/:organization_id?",
      passport.authenticate("jwt", { session: false }),
      EmployeeController.allManagerList
    );

    //All Employee Details

    this.router.get(
      "/allEmployeeDetails/:organization_id?",
      passport.authenticate("jwt", { session: false }),
      EmployeeController.allEmployeeDetails
    );
    this.router.get(
      "/staff_list",
      passport.authenticate("jwt", { session: false }),
      EmployeeController.staffListUnderStaff
    );

    this.router.get(
      "/role",
      passport.authenticate("jwt", { session: false }),
      EmployeeController.allRoleList
    );
    this.router.get(
      "/roles_collection",
      passport.authenticate("jwt", { session: false }),
      EmployeeController.allRoleCollection
    );

    //Salary Routes

    this.router.put(
      "/salary",
      passport.authenticate("jwt", { session: false }),
      EmployeeController.updateEmployeeSalary
    );

    this.router.get(
      "/salary_increment_history",
      passport.authenticate("jwt", { session: false }),
      EmployeeController.getSalaryIncrementHistory
    );

    // this.router.get(
    //   "/monthly/salary",
    //   passport.authenticate("jwt", { session: false }),
    //   EmployeeController.calculateEmployeeSalary
    // );

    this.router.get(
      "/monthly/salary",
      passport.authenticate("jwt", { session: false }),
      EmployeeController.EmployeeSalaryWithRules
    );

    this.router.get(
      "/salary/slip",
      passport.authenticate("jwt", { session: false }),
      EmployeeController.generateEmployeeSalarySlip
    );

    this.router.get(
      "/salary_slip/:organization_id?",
      passport.authenticate("jwt", { session: false }),
      EmployeeController.MonthlyAllEmployeeSalarySlip
    );

    this.router.post(
      "/salary/rules",
      passport.authenticate("jwt", { session: false }),
      EmployeeController.addSalaryRule
    );

    this.router.put(
      "/salary/rules",
      passport.authenticate("jwt", { session: false }),
      EmployeeController.updateSalaryRule
    );
    this.router.delete(
      "/salary/rules/:_id",
      passport.authenticate("jwt", { session: false }),
      EmployeeController.deleteSalaryRule
    );
    this.router.get(
      "/salary/rules",
      passport.authenticate("jwt", { session: false }),
      EmployeeController.allSalaryRuleList
    );
  }
}
export default new Employee_Router().router;
