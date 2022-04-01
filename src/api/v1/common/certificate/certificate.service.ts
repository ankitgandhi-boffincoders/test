import { DocumentType } from "@typegoose/typegoose";
import { Request, Response } from "express";
import pdf from "html-pdf";
import HttpStatus from "http-status-codes";
import moment from "moment";
import { v4 } from "uuid";
import { EnumRoles } from "../../contoller-services/employee-management/employee/employee.service";
import employeeModel, {
  Employees
} from "../../models/employee-management-models/employee.model";
import { Organization } from "../../models/employee-management-models/organization.model";
import { default as roles } from "../../models/employee-management-models/roles.model";
import { IServiceResult } from "../common-methods";
import uploadServices from "../upload/upload_media.service";
import { CertificateViewModel } from "./certificate_viewmodel";
const remove = require("fs-extra").remove;

class CertificateService {
  public certificate = async (
    req: Request,
    res: Response,
    model: CertificateViewModel
  ): Promise<IServiceResult> => {
    try {
      let userDetails = <DocumentType<Employees>>req.user;

      let findRequestUserRoles = await roles.find({
        _id: { $in: userDetails!.roles! },
      });
      let findRequestUserRolesDetails = findRequestUserRoles.map((role) => {
        return role.name;
      });

      if (
        !findRequestUserRolesDetails.some((e) =>
          [EnumRoles.MASTERADMIN.valueOf()].includes(e)
        )
      )
        return {
          data: {
            message: "You Are Not Authorized For Generate Certificate",
            error: "On Generating Certificate Error",
          },
          status_code: HttpStatus.UNAUTHORIZED,
        };
      else {
        let foundEmployee = await employeeModel
          .findById(model._id)
          .populate("organization_id");
        if (!foundEmployee)
          return {
            data: {
              message: "Employee Not Found",
              error: "On Generating Certificate Error",
            },
            status_code: HttpStatus.BAD_REQUEST,
          };
        else {
          let orgObj = <DocumentType<Organization>>(
            foundEmployee.organization_id
          );
          let dateObj = model.date
            ? moment(model.date).format("DD-MM-YYYY")
            : moment(new Date()).format("DD-MM-YYYY");
          // break award_description text from 73rd chaarcter
          // if (model.award_description && model.award_description.length > 73) {
          //   model.award_description =
          //     model.award_description.substring(0, 73) +
          //     "     " +
          //     "\n" +
          //     "\n" +
          //     "\n" +
          //     "\n";
          //   model.award_description.substring(73, model.award_description.length);
          // } else {
          //   model.award_description = model.award_description;
          //   ("\n");
          // }
          var employee = {
            name: foundEmployee.fullname,
            award_description: model.award_description,
            company_name: orgObj.name,
            date: dateObj,
            organization_logo: orgObj.logo,
          };

          var tagline =
            model.tagline ??
            "For Outstanding Perfromance And Lasting Contribution To";
          let resultReceivedCheck = false;
          let result: any;
          // getting actual output by rendering required feilds from  output provided by ejs template
          let output = res.render(
            "pages/index",
            {
              employee: employee,
              tagline: tagline,
            },
            async (err, html) => {
              if (err) console.log(err, "errrrrr");
              else {
                resultReceivedCheck = true;
                result = html;
              }
            }
          );

          ////////////

          let final_result: any;

          if (resultReceivedCheck && result) {
            //html to pdf
            let options: any = {
              format: "A4",
            };
            let uniqName = v4();
            let pdfPath = `D:\\officeproject\\public\\certificate\\${foundEmployee.fullname}_${uniqName}.pdf`;

            let promiseV = new Promise(async (resolve, reject) => {
              pdf
                .create(result, options)
                .toFile(pdfPath, async function (err: any, res: any) {
                  if (err) {
                    final_result = {
                      status_code: HttpStatus.BAD_REQUEST,
                      data: {
                        message: err,
                        error: "On Generating Certificate",
                      },
                    };
                  } else {
                    let path_result =
                      await uploadServices.uploadCertificateToCloudinary(
                        pdfPath,
                        model._id
                      );
                    remove(pdfPath);
                    final_result = {
                      status_code: HttpStatus.OK,
                      data: path_result.data,
                    };
                    resolve(final_result);
                  }
                });
            });

            await promiseV;
            if (!final_result.data.message) {
              await employeeModel.findOneAndUpdate(
                { _id: model._id },
                { $push: { certificates: final_result.data } }
              );
            }
            return {
              status_code: final_result!.status_code,
              data: final_result!.data,
            };
          } else
            return {
              status_code: HttpStatus.BAD_REQUEST,
              data: {
                message: " Certificate Not Generated",
                error: "On Generating Certificate",
              },
            };
        }
      }
    } catch (err) {
      console.log(err);

      return {
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        data: {
          message: "Internal Server Error Occurred",
          error: "On Generating Certificate",
        },
      };
    }
  };

}

export default new CertificateService();
