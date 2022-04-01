import { DocumentType } from "@typegoose/typegoose";
import fs from "fs";
import HttpStatus from "http-status-codes";
import Jimp from "jimp";
import moment from "moment";
import cron from "node-cron";
import { v4 } from "uuid";
import uploadService from "../../common/upload/upload_media.service";
import employeeModel from "../../models/employee-management-models/employee.model";
import leaveModel from "../../models/employee-management-models/leave.model";
import { LeaveDeductionCategory } from "../../models/employee-management-models/leave_deduction_category.model";
import LeaveTypeModel, {
  LeaveTypes
} from "../../models/employee-management-models/leave_type.model";
import { Organization } from "../../models/employee-management-models/organization.model";
import { Profile } from "../../models/employee-management-models/profile.model";
import SalaryRuleModel from "../../models/employee-management-models/salary_rules.model";
import sendMessage from "../../utils/mailer1";
import Utility from "../common-methods";
const remove = require("fs-extra").remove;

export const generate_salary_slip_cron_job = cron.schedule(
  "* 32 09 22 * *",
  async () => {
    try {
      let finalResultArray: any = [];
      let current_date = new Date();
      let req_month = current_date.getMonth();
      let req_year = current_date.getFullYear();
      console.log(req_month, req_year);

      if (req_month == 0) req_month = 11;

      ////////////////******All Employee Salary Slip */
      //Get All Employee List
      let allEmployeeList = await employeList();
      let result = await Promise.all(
        allEmployeeList.map(async (emp: any) => {
          let obj = {
            employee_id: emp._id.toString(),
            month: req_month,
            year: req_year,
          };
          let salary_slip_result = await salarySlip(obj);
          let salary_slip_path = salary_slip_result.data;
          let final_obj = {
            employee_id: emp._id.toString(),
            emp_email: emp.email,
            path: salary_slip_path,
            employee_name: emp.fullname,
          };
          let msgObj = {
            to: final_obj.emp_email,

            from: "ankit@boffincoders.com",
            subject: `Salary Slip`,
            content: `Hello ${final_obj.employee_name}, Download Your Salary Slip From This Link.
            Salary_Slip_Link:${final_obj.path},
            link: <a href=${final_obj.path}>This is Link<a/>`,
          };

          //notify staff manager about leave request
          sendMessage.sendMail1(msgObj);

          finalResultArray.push(final_obj);
          return final_obj;
        })
      );

      console.log(finalResultArray);

      //message(req_month, req_year, finalResultArray);
    } catch (error) {}
  }
);

function message(month: number, year: number, obj: any) {
  let month_names = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  obj.forEach((x: any) => {
    let message = {
      to: x.emp_email,
      from: "info@boffincoders.com",
      subject: `Salary Details For`,
      content: `${x.employee_name}, Please Find Salary Slip For${
        (month_names[month], year)
      }.
   
    
    salary_slip_link:${x.path}`,
    };
    sendMessage.sendMail1(message);
  });
}

async function employeList() {
  const foundEmployeeList = await employeeModel.find(
    {
      manager: { $exists: true },
    },

    { _id: 1, fullname: 1, email: 1, organization_id: 1 }
  );

  return foundEmployeeList;
}

async function salarySlip(obj: any) {
  let month_names = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  let monthDetails =
    month_names[obj.month - 1] + "," + obj.year + " Salary Details";
  let foundRuleList = await SalaryRuleModel.find({});
  let salaryDetails = await salaryWithRules(obj.month, obj.year, obj);

  if (salaryDetails.data.message)
    return {
      data: {
        message: "Salary Details Not Found For This Employee",
        error: "On Fetch Error",
      },
      status_code: HttpStatus.BAD_REQUEST,
    };

  let foundEmployeeDetails = await employeeModel
    .findById(obj.employee_id)
    .populate(["designation", "organization_id"]);
  let organizationInfo = <DocumentType<Organization>>(
    foundEmployeeDetails!["organization_id"]
  );
  let designationInfo = <DocumentType<Profile>>(
    foundEmployeeDetails!["designation"]
  );
  // let finalDateofJoining = moment(foundEmployeeDetails!.date_of_joining).format(
  //   "LL"
  // );

  let date_obj = foundEmployeeDetails!.date_of_joining.setDate(
    foundEmployeeDetails!.date_of_joining.getDate() - 1
  );
  let finalDateofJoining = moment(date_obj).format("LL");

  if (foundEmployeeDetails) {
    if (foundEmployeeDetails.bank_name == "")
      foundEmployeeDetails.bank_name = " ";
    if (foundEmployeeDetails.department == "")
      foundEmployeeDetails.department = " ";
    if (foundEmployeeDetails.pf_no == "") foundEmployeeDetails.pf_no = "  ";

    if (foundEmployeeDetails.uan == "") foundEmployeeDetails.uan = "  ";

    if (foundEmployeeDetails.esi_no == "") foundEmployeeDetails.esi_no = "  ";

    if (foundEmployeeDetails.empId == "") foundEmployeeDetails.empId = "  ";
    if (foundEmployeeDetails.bank_acc_no == "")
      foundEmployeeDetails.bank_acc_no = "  ";
  }
  let salarySlipObj = {
    _id: foundEmployeeDetails!._id,
    fullname: foundEmployeeDetails!.fullname,
    manager: foundEmployeeDetails!.manager,
    email: foundEmployeeDetails!.email,

    roles: foundEmployeeDetails!.roles,
    is_deleted: foundEmployeeDetails!.is_deleted,
    salary: foundEmployeeDetails!.salary,
    image: foundEmployeeDetails!.image,

    BankAccNo: foundEmployeeDetails!.bank_acc_no,
    EmpId: foundEmployeeDetails!.empId,
    Designation: designationInfo.name,
    Doj: finalDateofJoining,
    EsiNo: foundEmployeeDetails!.esi_no,
    UAN: foundEmployeeDetails!.uan,
    PFNO: foundEmployeeDetails!.pf_no,
    Department: foundEmployeeDetails!.department,
    BankName: foundEmployeeDetails!.bank_name,
    totalWorkingdays:
      salaryDetails.data!.LeaveHistoryThisMonth!.TotalWorkingDays,
    TotalPaidLeaves: salaryDetails.data!.LeaveHistoryThisMonth!.TotalPaidLeaves,
    TotalUnpaidLeaves:
      salaryDetails.data!.LeaveHistoryThisMonth!.TotalUnpaidLeaves,
    leavetaken: salaryDetails.data!.LeaveHistoryThisMonth!.TotalLeave,
    organization_id: organizationInfo._id.toString(), //foundEmployeeDetails.organization_id!.toString(),
    orgaization_name: organizationInfo.name, //organizationInfo.data.name,
    orgaization_address: organizationInfo.address, // organizationInfo.data.address,
    orgaization_email: organizationInfo.address, //organizationInfo.data.address,
    orgaization_logo: organizationInfo.logo, //organizationInfo.data.logo,
    orgaization_mobile_number: organizationInfo.mobile_number, //organizationInfo.data.mobile_number,
    MonthDetails: monthDetails,
    salaryDetails: salaryDetails,
    foundRuleList: foundRuleList,
  };

  let result = await salarySlipPDf(salarySlipObj);

  return {
    data: result.data,
    status_code: HttpStatus.OK,
  };
}
async function salaryWithRules(month: number, year: number, obj: any) {
  let operandsCheckFlag = false;
  let foundEmployee = await employeeModel.findById(obj.employee_id);

  if (!foundEmployee)
    return {
      data: { message: "Employee Not Found", error: "On Fetch Error" },
      status_code: HttpStatus.BAD_REQUEST,
    };
  else {
    let leaveHistoryThisMonth: any[] = [];
    let totalDaysInMonth = Utility.daysInMonth(obj.month, obj.year);

    //total sunday and Saturday In this month

    let totalSundays = Utility.countSpecificDayInMonth(
      obj.year,
      obj.month - 1,
      0
    );
    let totalSaturdays = Utility.countSpecificDayInMonth(
      obj.year,
      obj.month - 1,
      6
    );
    //

    let totalWorkingDays = totalDaysInMonth - totalSundays - totalSaturdays;

    let singleDaySalary = foundEmployee.salary / totalDaysInMonth;
    let totalLeaveAmountToBeDeduct = 0;

    let leaveTypeList = await LeaveTypeModel.find(
      {},
      { _id: 1, leave_type: 1, deduction_value: 1 }
    );

    let foundTotalLeave = await leaveModel
      .find({
        employee_id: obj.employee_id,
        leave_count_as: true,
      })
      .populate(["deduction_category", "leave_type"]);

    let totalLeavesCount = 0;

    let single_leave = 1;
    leaveTypeList.forEach((type) => {
      let countvalue = 0;
      foundTotalLeave.forEach((leave) => {
        if (leave.leave_count_as == true) {
          if (
            new Date(leave.from_date).getMonth() + 1 === month &&
            new Date(leave.to_date).getMonth() + 1 === month &&
            new Date(leave.from_date).getFullYear() == year &&
            new Date(leave.to_date).getFullYear() == year
          ) {
            let temp_leave = <DocumentType<LeaveTypes>>leave["leave_type"];
            let diffTime = Math.abs(
              new Date(leave.to_date).valueOf() -
                new Date(leave.from_date).valueOf() +
                1
            );
            let leave_days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (leave_days == 0) leave_days = single_leave;
            if (temp_leave.leave_type == type.leave_type)
              totalLeavesCount += leave_days;
          }
        }

        //
        let leaveDeduct = <DocumentType<LeaveDeductionCategory>>(
          leave["deduction_category"]
        );
        if (leaveDeduct.money_deduct == true) {
          if (
            new Date(leave.from_date).getMonth() + 1 === month &&
            new Date(leave.to_date).getMonth() + 1 === month &&
            new Date(leave.from_date).getFullYear() == year &&
            new Date(leave.to_date).getFullYear() == year
          ) {
            let temp_leave = <DocumentType<LeaveTypes>>leave["leave_type"];
            let diffTime = Math.abs(
              new Date(leave.to_date).valueOf() -
                new Date(leave.from_date).valueOf() +
                1
            );
            let leave_days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (leave_days == 0) leave_days = single_leave;
            if (temp_leave.leave_type == type.leave_type)
              countvalue += leave_days;
          }
        }
      });

      let foundDeductionPercentage = leaveTypeList.find(
        (element) => type.leave_type == element.leave_type
      );
      let deductAmountvalue = (
        (foundDeductionPercentage!.deduction_value *
          countvalue *
          singleDaySalary) /
        100
      ).toFixed(0);
      totalLeaveAmountToBeDeduct += parseInt(deductAmountvalue);
      let obj = {
        name: type.leave_type,
        count: countvalue,
        deducted_amount: parseInt(deductAmountvalue),
      };

      leaveHistoryThisMonth.push(obj);
    });
    let totalLeaveAmountDeductedDays = 0;
    let leaveResult = leaveHistoryThisMonth.filter((leaveObj) => {
      if (leaveObj.deducted_amount !== 0)
        totalLeaveAmountDeductedDays += leaveObj.count;
      if (leaveObj.count !== 0) return leaveObj;
    });
    let salaryRulesList = await SalaryRuleModel.find({ __v: 0 });

    ///Rules Applied
    let calculateAddedAmount = 0;
    let calculateDeductedAmount = 0;
    let basicPay = foundEmployee!.salary;
    let ruleAmountTobeAddedArray: any = [];
    let ruleAmountTobeDeductedArray: any = [];
    let total_employee = await employeeModel.find({}).countDocuments({});
    salaryRulesList.forEach((rule) => {
      let rule_is_applicable: (string | boolean)[] = [];
      let condition_list_to_be_checked = JSON.parse(
        JSON.stringify(rule.condition_array)
      );
      let valueToCheck = 0;
      if (rule.depends_upon === "salary") valueToCheck = foundEmployee!.salary!;
      if (rule.depends_upon === "employee_count") valueToCheck = total_employee;
      condition_list_to_be_checked.forEach((cObj: any) => {
        if (cObj.condition_name === "less_than") {
          if (valueToCheck < cObj.condition_value) {
            rule_is_applicable.push(true);
            if (cObj.operand) rule_is_applicable.push(cObj.operand);
          } else {
            rule_is_applicable.push(false);
            if (cObj.operand) rule_is_applicable.push(cObj.operand);
          }
        }
        if (cObj.condition_name === "equal_to") {
          if (valueToCheck == cObj.condition_value) {
            rule_is_applicable.push(true);
            if (cObj.operand) rule_is_applicable.push(cObj.operand);
          } else {
            rule_is_applicable.push(false);
            if (cObj.operand) rule_is_applicable.push(cObj.operand);
          }
        }
        if (cObj.condition_name === "greater_than_equal_to") {
          if (valueToCheck >= cObj.condition_value) {
            rule_is_applicable.push(true);
            if (cObj.operand) rule_is_applicable.push(cObj.operand);
          } else {
            rule_is_applicable.push(false);
            if (cObj.operand) rule_is_applicable.push(cObj.operand);
          }
        }
        if (cObj.condition_name === "greater_than") {
          if (valueToCheck > cObj.condition_value) {
            rule_is_applicable.push(true);
            if (cObj.operand) rule_is_applicable.push(cObj.operand);
          } else {
            rule_is_applicable.push(false);
            if (cObj.operand) rule_is_applicable.push(cObj.operand);
          }
        }

        if (cObj.condition_name == "not_equal_to") {
          if (foundEmployee!.salary !== cObj.condition_value) {
            rule_is_applicable.push(true);
            if (cObj.operand) rule_is_applicable.push(cObj.operand);
          } else {
            rule_is_applicable.push(false);
            if (cObj.operand) rule_is_applicable.push(cObj.operand);
          }
        }

        if (cObj.condition_name == "less_than_equal_to") {
          if (valueToCheck <= cObj.condition_value) {
            rule_is_applicable.push(true);
            if (cObj.operand) rule_is_applicable.push(cObj.operand);
          } else {
            rule_is_applicable.push(false);
            if (cObj.operand) rule_is_applicable.push(cObj.operand);
          }
        }
      });
      let finalRulesApplicableResult: any;
      rule_is_applicable.forEach((x, i) => {
        if (typeof x == "string" && x === "&&") {
          let el: string | boolean =
            finalRulesApplicableResult && rule_is_applicable[i + 1];
          finalRulesApplicableResult = el;
        } else if (typeof x == "string" && x === "||") {
          let el: string | boolean =
            finalRulesApplicableResult || rule_is_applicable[i + 1];

          finalRulesApplicableResult = el;
        } else {
          finalRulesApplicableResult = x;
        }
      });
      if (finalRulesApplicableResult == true) {
        if (rule.is_added === true) {
          let value = (rule.value * basicPay) / 100;
          let objAdd = {
            name: rule.rule_name,
            amount: value,
          };
          ruleAmountTobeAddedArray.push(objAdd);
          calculateAddedAmount = calculateAddedAmount + value;
        }

        if (rule.is_added === false) {
          let value = (rule.value * basicPay) / 100;
          let objDeduct = {
            name: rule.rule_name,
            amount: value,
          };
          ruleAmountTobeDeductedArray.push(objDeduct);
          calculateDeductedAmount = calculateDeductedAmount + value;
        }
      }
    });

    let employeeSalaryAfterAllRules =
      foundEmployee!.salary + calculateAddedAmount - calculateDeductedAmount;
    -totalLeaveAmountToBeDeduct;
    if (operandsCheckFlag)
      return {
        data: {
          message: "Provide value for perform condition",
          error: "On Fetch Error",
        },
        status_code: HttpStatus.BAD_REQUEST,
      };
    let totalUnpaidLeaveCount = 0;
    leaveResult.forEach((x) => {
      totalUnpaidLeaveCount += x.count;
    });
    return {
      status_code: HttpStatus.OK,
      data: {
        SalaryOfThisMonth: employeeSalaryAfterAllRules,
        TotalLeaveAmountToBeDeduct: totalLeaveAmountToBeDeduct,
        ruleAmountTobeAdded: calculateAddedAmount,
        ruleAmountTobeDeducted: calculateDeductedAmount,
        LeaveHistoryThisMonth: {
          TotalLeave: totalLeavesCount, // totalUnpaidLeaveCount,
          TotalPaidLeaves: totalLeavesCount - totalUnpaidLeaveCount,
          TotalUnpaidLeaves: totalUnpaidLeaveCount,
          TotalWorkingDays: totalWorkingDays,
          TotalPaidDays: totalWorkingDays - totalLeaveAmountDeductedDays,
          History: leaveResult,
        },
        TotalRulesAmountHistory: {
          AmountTobeAdded: ruleAmountTobeAddedArray,
          AmountTobeDeducted: ruleAmountTobeDeductedArray,
        },
      },
    };
  }
}

async function salarySlipPDf(obj: any) {
  try {
    let foundEmployee = obj;

    const PDFDocument = require("pdfkit");

   
    var doc = new PDFDocument({
      size: "A4",
      margins: {
        top: 10,
        bottom: 10,
        left: 10,
        right: 10,
      },
    });
    let pdfFileName = v4();
    doc.fontSize(10);
    var writeStream = fs.createWriteStream(
      `D:\\officeproject\\public\\salarySlip\\${pdfFileName}.pdf`
    );
    doc.pipe(writeStream);

    let secondDividerPoint = doc.page.width / 2;
    let firstDividerPoint = secondDividerPoint / 2;
    let thirdDividerPoint = firstDividerPoint + secondDividerPoint;

    let leftStart = (doc.page.margins.left ?? doc.page.margins) + 1;
    let rightEnd =
      doc.page.width - (doc.page.margins.right ?? doc.page.margins);
//


//
    let name = v4();
    let tempFilePath="D:\\officeproject\\public\\logo"
    let imagename = name + ".png";
    let path = "D:\\officeproject\\public\\logo\\" + imagename;
    await uploadService.downloadFile(
      foundEmployee.orgaization_logo,
      tempFilePath,
      imagename
    );
    //remove(tempFilePath);

    doc
      .image(
        path,
        leftStart,
        doc.y,

        { fit: [100, 100] }
      )
      .moveDown(1.0);

    let startDocY = doc.y;

    let waterMarkEndY = 0;
    doc
      .font("Helvetica-BoldOblique")
      .rect(leftStart, doc.y, rightEnd - 10, 0)
      .moveTo(firstDividerPoint, doc.y)
      .moveDown(0.2)
      .text(foundEmployee.orgaization_name, secondDividerPoint - 40, doc.y, {
        indent: 2,
        align: "left",
      })

      .moveDown(0.2)
      .rect(leftStart, doc.y, rightEnd - 10, 0)
      .moveTo(firstDividerPoint, doc.y)
      .moveDown(0.2)
      .text(foundEmployee.orgaization_address, secondDividerPoint - 40, doc.y, {
        indent: 2,
        align: "left",
      })
      .moveDown(0.1)
      .rect(leftStart, doc.y, rightEnd - 10, 0)
      .moveTo(firstDividerPoint, doc.y)
      .moveDown(0.2)
      .text(foundEmployee.MonthDetails, secondDividerPoint - 40, doc.y, {
        indent: 2,
        align: "left",
      })
      .moveDown(0.2)
      .font("Helvetica")
      .rect(leftStart, doc.y, rightEnd - 10, 0)
      .moveTo(firstDividerPoint, doc.y)
      .lineTo(firstDividerPoint, doc.y + 72)
      .moveDown(0.2)
      .text("Employee Name ", leftStart, doc.y, {
        indent: 2,
        align: "left",
      })

      .moveUp()
      .text(foundEmployee.fullname, firstDividerPoint + 1, doc.y, {
        indent: 2,
      })

      .moveTo(secondDividerPoint, doc.y - 14)
      .lineTo(secondDividerPoint, doc.y + 57) //2nd  partition line
      .moveDown(0.2)
      .text("UAN", secondDividerPoint, doc.y - 14, {
        indent: 2,
        align: "left",
      })

      .moveUp()
      .text(foundEmployee.UAN, thirdDividerPoint, doc.y, {
        indent: 2,
      })
      .moveTo(thirdDividerPoint, doc.y - 14)
      .lineTo(thirdDividerPoint, doc.y + 57) //third partition line
      .moveDown(0.2);

    doc

      .text("Employee ID", leftStart, doc.y, {
        indent: 2,
      })

      .moveUp()
      .text(foundEmployee.EmpId, firstDividerPoint + 1, doc.y, {
        indent: 2,
      })
      .rect(leftStart, doc.y - 14, rightEnd - 10, 0)
      .moveTo(secondDividerPoint, doc.y - 14)
      .moveDown(0.3)
      .text("PF No. ", secondDividerPoint, doc.y - 14, {
        indent: 2,
        align: "left",
      })

      .moveUp()
      .text(foundEmployee.PFNO, thirdDividerPoint, doc.y, {
        indent: 2,
      })

      .rect(leftStart, doc.y, rightEnd - 10, 0)
      .moveTo(firstDividerPoint, doc.y)
      .moveDown(0.2)
      .text("Designation", leftStart, doc.y, {
        indent: 2,
        align: "left",
      })

      .moveUp()
      .text(foundEmployee.Designation, firstDividerPoint + 1, doc.y, {
        indent: 2,
      })

      .moveTo(secondDividerPoint, doc.y - 14)
      .moveDown(0.2)
      .text("ESI No. ", secondDividerPoint, doc.y - 14, {
        indent: 2,
        align: "left",
      })
      .moveUp()
      .text(foundEmployee.EsiNo, thirdDividerPoint, doc.y, {
        indent: 2,
      })

      .rect(leftStart, doc.y, rightEnd - 10, 0)
      .moveTo(firstDividerPoint, doc.y)
      .moveDown(0.2)
      .text("Department", leftStart, doc.y, {
        indent: 2,
        align: "left",
      })
      .moveUp()
      .text(foundEmployee.Department, firstDividerPoint + 1, doc.y, {
        indent: 2,
      })
      .moveTo(secondDividerPoint, doc.y - 14)
      .moveDown(0.2)
      .text("Bank Name", secondDividerPoint, doc.y - 14, {
        indent: 2,
        align: "left",
      })
      .moveUp()
      .text(foundEmployee.BankName, thirdDividerPoint, doc.y, {
        indent: 2,
      });

    doc
      .rect(leftStart, doc.y, rightEnd - 10, 0)
      .moveTo(firstDividerPoint, doc.y)
      .moveDown(0.2)
      .text("DOJ", leftStart, doc.y, {
        indent: 2,
        align: "left",
      })
      .moveUp()
      .text(foundEmployee.Doj, firstDividerPoint + 1, doc.y, {
        indent: 2,
      })

      .moveTo(secondDividerPoint, doc.y - 14)
      .moveDown(0.2)
      .text("Bank Acc No", secondDividerPoint, doc.y - 14, {
        indent: 2,
        align: "left",
      })
      .moveUp()
      .text(foundEmployee.BankAccNo, thirdDividerPoint, doc.y, {
        indent: 2,
      })
      .moveUp();
    //add empty row
    doc
      .rect(leftStart, doc.y + 14, rightEnd - 10, 0)
      .moveDown(0.2)
      .text(" ", leftStart, doc.y, {
        indent: 2,
        align: "left",
      })
      .moveUp()
      .text(" ", firstDividerPoint + 1, doc.y, {
        indent: 2,
      });
    doc
      .rect(leftStart, doc.y + 14, rightEnd - 10, 0)
      .moveDown(0.2)
      .text(" ", secondDividerPoint, doc.y - 14, {
        indent: 2,
        align: "left",
      })
      .moveUp()
      .text(" ", thirdDividerPoint, doc.y, {
        indent: 2,
      })

      /************ First Section Complete *******/

      ////////////2nd part///////////////
      .moveDown(1.5);

    doc
      .rect(leftStart, doc.y + 25, rightEnd - 10, 0)
      .moveTo(firstDividerPoint, doc.y - 2)
      .lineTo(firstDividerPoint, doc.y + 25)
      .text("Total Working Days", leftStart, doc.y, {
        indent: 2,
        align: "left",
      })
      .moveUp()
      .text(foundEmployee.totalWorkingdays, firstDividerPoint + 1, doc.y, {
        indent: 2,
      })
      .moveTo(secondDividerPoint, doc.y - 14)
      .lineTo(secondDividerPoint, doc.y + 13)
      .moveDown(0.2)
      .text("Paid Leaves", secondDividerPoint, doc.y - 14, {
        indent: 2,
        align: "left",
      })
      .moveUp()
      .text(foundEmployee.TotalPaidLeaves, thirdDividerPoint, doc.y, {
        indent: 2,
      });
    doc
      .rect(leftStart, doc.y - 14, rightEnd - 10, 0)
      .moveTo(thirdDividerPoint, doc.y - 14)
      .lineTo(thirdDividerPoint, doc.y + 13) // 2nd part third partition line
      .moveTo(firstDividerPoint, doc.y)
      .moveDown(0.2)
      .text("Unpaid Leaves", leftStart, doc.y, {
        indent: 2,
        align: "left",
      })
      .moveUp()
      .text(foundEmployee.TotalUnpaidLeaves, firstDividerPoint + 1, doc.y, {
        indent: 2,
      });
    //.moveDown(0.1);
    doc
      .rect(leftStart, doc.y - 14, rightEnd - 10, 0)
      .moveTo(secondDividerPoint, doc.y - 14)
      .moveDown(0.2)
      .text("Leaves Taken", secondDividerPoint, doc.y - 14, {
        indent: 2,
        align: "left",
      })
      .moveUp()
      .text(foundEmployee.leavetaken, thirdDividerPoint, doc.y, {
        indent: 2,
      })
      .moveDown(0.2)
      /////////////////3rd part/////////////
      .moveDown(1);

    doc.font("Helvetica-Bold");
    doc
      .rect(leftStart, doc.y - 14, rightEnd - 10, 0)

      .moveTo(firstDividerPoint, doc.y)

      .text("Earnings", 100, doc.y, {
        indent: 2,
        align: "left",
      });

    doc
      .rect(leftStart, doc.y - 14, rightEnd - 10, 0)
      .moveTo(secondDividerPoint, doc.y - 14)
      .lineTo(secondDividerPoint, doc.y + 15)
      .moveDown(0.2)
      .text("Deductions ", 400, doc.y - 14, {
        indent: 2,
        align: "left",
      });

    doc
      .rect(leftStart, doc.y, rightEnd - 10, 0) // earning && deduction below  rectangle boundary
      .moveTo(thirdDividerPoint, doc.y)
      .lineTo(thirdDividerPoint, doc.y + 15); //3rd part third partition line

    doc
      .font("Helvetica")
      .rect(leftStart, doc.y + 14, rightEnd - 10, 0)
      .moveTo(firstDividerPoint, doc.y)
      .lineTo(firstDividerPoint, doc.y + 15)
      .moveDown(0.2)
      .text("Basic Salary", leftStart, doc.y, {
        indent: 2,
        align: "left",
      })

      .moveUp()
      .text(foundEmployee.salary, firstDividerPoint + 1, doc.y, {
        indent: 2,
      })
      .moveDown(0);

    //salaryDetails
    let ruleAddedAmountArray = JSON.parse(
      JSON.stringify(
        obj.salaryDetails.data["TotalRulesAmountHistory"].AmountTobeAdded
      )
    );
    let ruleDeductedAmountArray = JSON.parse(
      JSON.stringify(
        obj.salaryDetails.data["TotalRulesAmountHistory"].AmountTobeDeducted
      )
    );
    let all_added_rules: any = [];
    let all_deducted_rules: any = [];
    obj.foundRuleList.forEach((x: any) => {
      if (x.is_added === true) all_added_rules.push(x);
      else all_deducted_rules.push(x);
    });
    let totalLength = 0;
    if (all_added_rules.length > all_deducted_rules.length)
      totalLength = all_added_rules.length;
    else totalLength = all_deducted_rules.length;
    let totalEarnings = 0;
    let totalDeductions = 0;
    let allAppliedRules = [...ruleAddedAmountArray, ...ruleDeductedAmountArray];
    waterMarkEndY = totalLength * 14 + doc.y + 14;
    //watermark add

    let img_path = "D:\\logo.png";
    // let imagePath = await imageOpacity(img_path);

    doc.image(
      // imagePath.data,
      "D:\\logo.png",
      firstDividerPoint,
      (startDocY + waterMarkEndY) / 2,
      {
        width: thirdDividerPoint - firstDividerPoint,
        height: 52,
        blur: 10,
        //  imageOpacity:0.3,
        // fillOpacity:0.3
      }
    );
    for (let i = 0; i < totalLength; i++) {
      doc
        .rect(leftStart, doc.y + 14, rightEnd - 10, 0)
        .moveTo(firstDividerPoint, doc.y + 1)
        .lineTo(firstDividerPoint, doc.y + 15)
        .moveTo(secondDividerPoint, doc.y - 14)
        .lineTo(secondDividerPoint, doc.y + 15)
        .moveTo(thirdDividerPoint, doc.y)
        .lineTo(thirdDividerPoint, doc.y + 15)
        .moveDown(0.2);
      if (i < all_added_rules.length) {
        let amountValue = 0;
        allAppliedRules.forEach((x) => {
          if (x.name == all_deducted_rules[i].rule_name) amountValue = x.amount;
        });
        doc.text(
          all_deducted_rules[i].rule_name,
          secondDividerPoint,
          doc.y - 14,
          {
            indent: 2,
            align: "left",
          }
        );

        doc
          .moveUp()
          .text(amountValue, thirdDividerPoint, doc.y, {
            indent: 2,
          })
          .moveDown(0.2);
        totalDeductions += amountValue;
      }
      if (i < all_deducted_rules.length) {
        let amountValueToBeAdd = 0;
        allAppliedRules.forEach((x) => {
          if (x.name == all_added_rules[i]?.rule_name)
            amountValueToBeAdd = x.amount;
        });
        doc
          .text(all_added_rules[i]?.rule_name, leftStart, doc.y, {
            indent: 2,
            align: "left",
          })

          .moveUp()
          .text(amountValueToBeAdd, firstDividerPoint + 1, doc.y, {
            indent: 2,
          });
        totalEarnings += amountValueToBeAdd;
      }
    }
    //Add empty Row
    doc
      .rect(leftStart, doc.y + 14, rightEnd - 10, 0)
      .moveDown(0.2)
      .text(" ", leftStart, doc.y, {
        indent: 2,
        align: "left",
      })
      .moveUp()
      .text(" ", firstDividerPoint + 1, doc.y, {
        indent: 2,
      });
    doc
      .rect(leftStart, doc.y + 14, rightEnd - 10, 0)
      .moveDown(0.2)
      .text(" ", secondDividerPoint, doc.y - 14, {
        indent: 2,
        align: "left",
      })
      .moveUp()
      .text(" ", thirdDividerPoint, doc.y, {
        indent: 2,
      });
    ///
    doc

      .rect(leftStart, doc.y + 14, rightEnd - 10, 0)
      .moveTo(firstDividerPoint, doc.y)
      .lineTo(firstDividerPoint, doc.y + 15)
      .moveTo(thirdDividerPoint, doc.y + 1)
      .lineTo(thirdDividerPoint, doc.y + 14)
      .moveDown(0.2)
      .text("Total Earnings", leftStart, doc.y, {
        indent: 2,
        align: "left",
      })

      .moveUp()
      .text(
        totalEarnings + foundEmployee.salary,
        firstDividerPoint + 1,
        doc.y,
        {
          indent: 2,
        }
      );

    doc
      .rect(leftStart, doc.y + 14, rightEnd - 10, 0)
      .moveTo(secondDividerPoint, doc.y - 14)
      .lineTo(secondDividerPoint, doc.y)
      .moveTo(thirdDividerPoint, doc.y + 1)
      .lineTo(thirdDividerPoint, doc.y)
      .moveDown(0.2)
      .text("Total Deductions", secondDividerPoint, doc.y - 14, {
        indent: 2,
        align: "left",
      })
      .moveUp()
      .text(totalDeductions, thirdDividerPoint, doc.y, {
        indent: 2,
      });

    //Add empty Row
    doc

      .rect(leftStart, doc.y + 14, rightEnd - 10, 0)

      .moveDown(0.1)
      .text(" ", leftStart, doc.y, {
        indent: 2,
        align: "left",
      })

      .moveUp()
      .text(" ", firstDividerPoint + 1, doc.y, {
        indent: 2,
      });

    doc
      .rect(leftStart, doc.y + 14, rightEnd - 10, 0)

      .moveDown(0.2)

      .text(" ", secondDividerPoint, doc.y - 14, {
        indent: 2,
        align: "left",
      })

      .moveUp()
      .text(" ", thirdDividerPoint, doc.y, {
        indent: 2,
      });

    //
    doc.moveDown(0.1);
    doc
      .rect(leftStart, doc.y + 14, rightEnd - 10, 0)

      .moveTo(secondDividerPoint, doc.y - 14)
      .moveDown(0.2)
      .font("Helvetica-BoldOblique")

      .text("Net Salary", 150, doc.y, {
        indent: 2,
        align: "left",
      })

      .moveUp()
      .text(
        totalEarnings + foundEmployee.salary - totalDeductions + "/-",
        thirdDividerPoint,
        doc.y,
        {
          indent: 2,
        }
      )
      .moveTo(leftStart, startDocY)
      .lineTo(leftStart, doc.y)

      .moveTo(rightEnd, startDocY)
      .lineTo(rightEnd, doc.y);
    waterMarkEndY = doc.y;
    doc.stroke().moveDown(0.2);

    doc.end();

    return {
      data: writeStream.path,
      status_code: HttpStatus.OK,
    };
  } catch (error) {
    console.log(error);
    return {
      status_code: HttpStatus.INTERNAL_SERVER_ERROR,
      data: {
        message: "Internal Server Error",
        Error: "On Update Error",
      },
    };
  }
}

async function imageOpacity(path: string) {
  let new_path;
  const image = await Jimp.read(path)
    // .then((result) => {
    //   return result;
    // })
    .then((ss: any) => {
      ss.fade(0.3).write("D:\\opacity1.png");
      new_path = "D:\\opacity1.png";
    });

  return {
    data: "D:\\opacity1.png",
    status_code: HttpStatus.OK,
  };
}

// let sharp = require('sharp');
//     let buffer = null;

//        let ii= async ()=>{await sharp(path)
//         .composite([{ input: path, gravity: 'center' }])
//         .sharpen()
//         .withMetadata()
//         .toBuffer()
//         .then(function(outputBuffer) {
//             buffer = outputBuffer;
//         });
//     return buffer;
// }

// var dataStuff = [
//     { Name: "Apple", Tag: "Fruit", Price: "2,5" },
//     { Name: "Bike", Tag: "Sport", Price: "150" },
//     { Name: "Kiwi", Tag: "Fruit", Price: "1,5" },
//     { Name: "Knife", Tag: "Kitchen", Price: "8" },
//     { Name: "Fork", Tag: "Kitchen", Price: "7" },
//   ],
//   grouped = Object.create(null);

// dataStuff.forEach(function (a) {
//   grouped[a.Tag] = grouped[a.Tag] || [];
//   grouped[a.Tag].push(a);
// });

// console.log(Object.keys(grouped));
// console.log(
//   "<pre>" +
//     JSON.stringify(
//       grouped
//       // , 0, 4
//     ) +
//     "</pre>"
// );
