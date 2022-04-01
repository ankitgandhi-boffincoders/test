import { DocumentType } from "@typegoose/typegoose";
import { Request } from "express";
import HttpStatus from "http-status-codes";
import _ from "lodash";
import mongoose from "mongoose";
import { v4 as uuid } from "uuid";
import { IServiceResult } from "../../../common/common-methods";
import InventoryModel, { Inventory } from "../../../models/hr-management/inventory.model";
import InventoryFormModel, {
    InventoryForm
} from "../../../models/hr-management/inventory_form.model";
import { AddInventoryViewmodel } from "../../../view-models/hr-management-viewmodels/inventory/add_inventory.viewmodel";
import {
    AddInventoryFormViewmodel,
    UpdateInventoryFormViewmodel
} from "../../../view-models/hr-management-viewmodels/inventory/forms";
class InventoryService {
  addInventoryForm = async (
    req: Request,
    model: AddInventoryFormViewmodel
  ): Promise<IServiceResult> => {
    try {
      let foundFormKeyFeilds = await InventoryFormModel.find({
        key: model.key,
      });
      if (foundFormKeyFeilds && foundFormKeyFeilds.length > 0)
        return {
          data: {
            message: "Form Already Existed With This Key",
            error: "On Add Error",
          },
          status_code: HttpStatus.BAD_REQUEST,
        };
      else {
        let modelToSave = <DocumentType<InventoryForm>>model;
        model.feilds = _.uniqBy(model.feilds, "title");
        let is_required_error_array: any = [];
        let regex_error_array: any = [];
        let finalFormFeildsDetails: any = [];
        model.feilds.forEach((x, i) => {
          let feild_obj = {
            ...x,
            feild_id: uuid(),
          };
          finalFormFeildsDetails.push(feild_obj);
          if (
            x.is_required === true &&
            (x.is_required_error == "" || x.is_required_error == undefined)
          ) {
            let isRequireErrorObj = {
              feild: `feilds_array[${i}] is_required_error`,
              message: "is_required_error feild can't be empty",
            };

            is_required_error_array.push(isRequireErrorObj);
          }

          if (
            x.regex != "" &&
            (x.regex_error == "" || x.regex_error == undefined)
          ) {
            let isRegexrrorObj = {
              feild: `feilds_array[${i}] regex_error`,
              message: "regex_error feild can't be empty",
            };

            regex_error_array.push(isRegexrrorObj);
          }
        });

        //error result
        let errorResult: any = [];
        if (
          regex_error_array.length > 0 ||
          is_required_error_array.length > 0
        ) {
          if (
            regex_error_array.length > 0 &&
            is_required_error_array.length == 0
          )
            errorResult = { regex_fail_error: regex_error_array };
          else if (
            regex_error_array.length == 0 &&
            is_required_error_array.length > 0
          )
            errorResult = { is_required_errors: is_required_error_array };
          else
            errorResult = {
              is_required_check_errors: is_required_error_array,
              regex_fail_errors: regex_error_array,
            };
          return {
            status_code: HttpStatus.BAD_REQUEST,
            data: { message: errorResult, error: "On Add Error" },
          };
        }
        modelToSave.feilds = finalFormFeildsDetails;
        let createInventoryForm = await InventoryFormModel.create(modelToSave);
        if (createInventoryForm)
          return {
            status_code: HttpStatus.OK,
            data: createInventoryForm,
          };
        else
          return {
            status_code: HttpStatus.BAD_REQUEST,
            data: {
              message: "An Error Occurred While Creating Form",
              Error: "On Add Error",
            },
          };
      }
    } catch (error) {
      console.log(error);

      return {
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        data: {
          message: "Internal Server Error",
          Error: "On Add Error",
        },
      };
    }
  };
  updateInventoryForm = async (
    req: Request,
    model: UpdateInventoryFormViewmodel
  ): Promise<IServiceResult> => {
    try {
      let foundForm = await InventoryFormModel.findById(model._id);
      if (!foundForm)
        return {
          data: { message: "Form Not Found", error: "On Update Error" },
          status_code: HttpStatus.BAD_REQUEST,
        };
      else {
        model.feilds = _.uniqBy(model.feilds, "title");

        let is_required_error_array: any = [];

        let regex_error_array: any = [];
        let finalFormFeildsDetails: any = [];
        model.feilds.forEach((x, i) => {
          if (
            x.is_required === true &&
            (x.is_required_error == "" || x.is_required_error == undefined)
          ) {
            let isRequireErrorObj = {
              feild: `feilds_array[${i}] is_required_error`,
              message: "is_required_error feild can't be empty",
            };

            is_required_error_array.push(isRequireErrorObj);
          }

          if (
            x.regex != "" &&
            (x.regex_error == "" || x.regex_error == undefined)
          ) {
            let isRegexrrorObj = {
              feild: `feilds_array[${i}] regex_error`,
              message: "regex_error feild can't be empty",
            };

            regex_error_array.push(isRegexrrorObj);
          }

          let form_obj = {
            feilds: { ...x },
            key: model.key,
          };

          finalFormFeildsDetails.push(form_obj);
        });

        //error result
        let errorResult: any = [];
        if (
          regex_error_array.length > 0 ||
          is_required_error_array.length > 0
        ) {
          if (
            regex_error_array.length > 0 &&
            is_required_error_array.length == 0
          )
            errorResult = { regex_fail_error: regex_error_array };
          else if (
            regex_error_array.length == 0 &&
            is_required_error_array.length > 0
          )
            errorResult = { is_required_errors: is_required_error_array };
          else
            errorResult = {
              is_required_check_errors: is_required_error_array,
              regex_fail_errors: regex_error_array,
            };
          return {
            status_code: HttpStatus.BAD_REQUEST,
            data: { message: errorResult, error: "On Update Error" },
          };
        }
        let modelToSave: InventoryForm = <DocumentType<InventoryForm>>model;

        let updatedInventoryForm = await InventoryFormModel.updateOne(
          { _id: new mongoose.Types.ObjectId(model._id) },
          { feilds: modelToSave.feilds }
        );

        if (updatedInventoryForm && updatedInventoryForm.modifiedCount > 0)
          return {
            status_code: HttpStatus.OK,
            data: true,
          };
        else
          return {
            status_code: HttpStatus.BAD_REQUEST,
            data: {
              message: "An Error Occurred While Updating Form",
              Error: "On Update Error",
            },
          };
      }
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
  };
  deleteInventoryForm = async (req: Request): Promise<IServiceResult> => {
    try {
      let deleteInventoryFormResult = await InventoryFormModel.deleteOne({
        _id: new mongoose.Types.ObjectId(req.params._id),
      });
      if (
        deleteInventoryFormResult &&
        deleteInventoryFormResult.deletedCount > 0
      )
        return {
          status_code: HttpStatus.OK,
          data: true,
        };
      else
        return {
          status_code: HttpStatus.BAD_REQUEST,
          data: {
            message: "An Error Occurred While Deleting Inventory Form",
            Error: "On Delete Error",
          },
        };
    } catch (error) {
      console.log(error);

      return {
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        data: {
          message: "Internal Server Error",
          Error: "On Delete Error",
        },
      };
    }
  };

  listAllInventoryForm = async (req: Request): Promise<IServiceResult> => {
    try {
      // let userDetails = <DocumentType<Employees>>req.user;
      // let findRequestUserRoles = await roles.find({
      //   _id: { $in: userDetails.roles },
      // });
      // let findRequestUserRolesDetails = findRequestUserRoles.map((role) => {
      //   return role.name;
      // });

      // if (
      //   !findRequestUserRolesDetails.some((e) =>
      //     ["masteradmin", "superadmin"].includes(e)
      //   )
      // )
      //   return {
      //     data: {
      //       message: "You Are Not Authorized For Add Employees",
      //       error: "On Add Error",
      //     },
      //     status_code: HttpStatus.BAD_REQUEST,
      //   };
      let InventoryFormList = await InventoryFormModel.find(
        {},
        { _id: 0, key: 1 }
      ).distinct("key");
      if (InventoryFormList && InventoryFormList.length > 0)
        return {
          status_code: HttpStatus.OK,

          data: InventoryFormList,
        };
      else
        return {
          status_code: HttpStatus.BAD_REQUEST,
          data: {
            message: "Inventory Form List Not Found",
            Error: "On Fetch Error",
          },
        };
    } catch (error) {
      console.log(error);

      return {
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        data: {
          message: "Internal Server Error",
          Error: "On Fetch Error",
        },
      };
    }
  };

  getInventoryFormFeilds = async (req: Request): Promise<IServiceResult> => {
    try {
      let InventoryFormFeildsList = await InventoryFormModel.findOne({
        key: req.params.key,
      });
      if (InventoryFormFeildsList)
        return {
          status_code: HttpStatus.OK,
          data: InventoryFormFeildsList,
        };
      else
        return {
          status_code: HttpStatus.BAD_REQUEST,
          data: {
            message: "Inventory Form Feilds Details Not Found For This Key",
            Error: "On Fetch Error",
          },
        };
    } catch (error) {
      console.log(error);
      return {
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        data: {
          message: "Internal Server Error",
          Error: "On Fetch Error",
        },
      };
    }
  };

  addInventory = async (
    req: Request,
    model: AddInventoryViewmodel
  ): Promise<IServiceResult> => {
    try {
      req.params.key = model.key;
      //found all feilds
      let foundAllFeilds = await this.getInventoryFormFeilds(req);
      let required_feilds: any = [];

      if (foundAllFeilds.data.message)
        return {
          status_code: HttpStatus.BAD_REQUEST,
          data: {
            message: "Form Feilds Details Not Found",
            Error: "On Add Error",
          },
        };
      //found all required feilds
      foundAllFeilds.data.feilds.forEach((x: any) => {
        if (x.is_required === true) {
          required_feilds.push(x.feild_id);
        }
      });

      let not_found_required_feilds: any = [];
      required_feilds.forEach((x: any) => {
        if (!req.body.hasOwnProperty(x)) {
          foundAllFeilds.data.feilds.forEach((y: any) => {
            if (y.feild_id == x) {
              let obj = {
                feild: `${y.feild_id}`,
                message: `${y.is_required_error}`,
              };
              not_found_required_feilds.push(obj);
            }
          });
        }
      });

      if (not_found_required_feilds.length > 0) {
        return {
          data: { message: not_found_required_feilds, error: "On Add Error" },
          status_code: HttpStatus.BAD_REQUEST,
        };
      }

      //Add Inventory Doc
      let modelToSave: any = <DocumentType<Inventory>>model;
      let reqFeilds = Object.keys(req.body);

      let errorArray: any = [];
      let regexErrorArray: any = [];

      reqFeilds.forEach((y: any) => {
        foundAllFeilds.data.feilds.forEach((check_feild: any) => {
          if (check_feild.feild_id == y) {
            console.log(check_feild.feild_id);
            if (check_feild.type === "number") {
              req.body[y] = Number(parseFloat(req.body[y]).toFixed(2));
              console.log(req.body[y]);
              modelToSave[check_feild.feild_id] = req.body[y];
            }
            if (check_feild.type != typeof req.body[y]) {
              console.log(check_feild.type, typeof req.body[y]);

              let errorObj = {
                data: {
                  message: ` feild: ${check_feild.feild_id} is must be type of ${check_feild.type}`,
                  error: "On Add Error",
                },
                status_code: HttpStatus.BAD_REQUEST,
              };
              errorArray.push(errorObj.data.message);
            }

            ///check later///////////////////////////
            // if (isNaN(req.body[y])) {
            //   {
            //     let errorObj = {
            //       feild: `${check_feild.feild_id}`,
            //       message: ` must be ${check_feild.type} type`,
            //     };
            //     errorArray.push(errorObj);

            ///////////////////////////////////////////////////////
            // let errorObj = {
            //   data: {
            //     message: ` feild: ${check_feild.title} must be ${check_feild.type} type`,
            //     error: "On Add Error",
            //   },
            //   status_code: HttpStatus.BAD_REQUEST,
            // };

            // errorArray.push(errorObj.data.message);
            //  }
            //}
            //}

            if (check_feild.regex !== "") {
              var reg = new RegExp(`${check_feild.regex}`);

              let regex_check = reg.test(req.body[y]);

              let regexErrorObj = {
                feild: `${check_feild.feild_id}`,
                message: ` ${check_feild.regex_error}`,
              };
              if (regex_check == false) regexErrorArray.push(regexErrorObj);
            }
          }
        });
      });

      let errorResult: any = [];
      if (errorArray.length > 0 || regexErrorArray.length > 0) {
        if (errorArray.length > 0 && regexErrorArray.length == 0)
          errorResult = { feild_type_check_errors: errorArray };
        else if (errorArray.length == 0 && regexErrorArray.length > 0)
          errorResult = { regex_fail_error: regexErrorArray };
        else
          errorResult = {
            feild_type_check_errors: errorArray,
            regex_fail_errors: regexErrorArray,
          };

        return {
          status_code: HttpStatus.BAD_REQUEST,
          data: { message: errorResult, error: "On Add Error" },
        };
      }
      console.log(modelToSave, "modelToSave");

      let addInventoryResult = await InventoryModel.create(modelToSave);

      if (addInventoryResult)
        return {
          status_code: HttpStatus.OK,
          data: addInventoryResult,
        };
      else
        return {
          status_code: HttpStatus.BAD_REQUEST,
          data: {
            message: "Inventory Details not Added",
            Error: "On Add Error",
          },
        };
    } catch (error) {
      console.log(error);

      return {
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        data: {
          message: "Internal Server Error",
          Error: "On Add Error",
        },
      };
    }
  };

  getInventoryDetails = async (req: Request): Promise<IServiceResult> => {
    try {
      let getInventoryResult = await InventoryModel.find({
        key: req.params.key,
      }).sort({ createdAt: -1 });

      if (getInventoryResult && getInventoryResult.length > 0)
        return {
          status_code: HttpStatus.OK,
          data: getInventoryResult[0],
        };
      else
        return {
          status_code: HttpStatus.BAD_REQUEST,
          data: {
            message: "Inventory Details not Found",
            Error: "On Fetch Error",
          },
        };
    } catch (error) {
      console.log(error);
      return {
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        data: {
          message: "Internal Server Error",
          Error: "On Fetch Error",
        },
      };
    }
  };
  // addInventoryFormOld = async (
  //   req: Request,
  //   model: AddInventoryFormViewmodel
  // ): Promise<IServiceResult> => {
  //   try {
  //     let form_feilds_array: any = [];
  //     model.feilds_array = _.uniqBy(model.feilds_array, "title");
  //     let foundFormKeyFeilds = await InventoryFormModel.find({
  //       key: model.key,
  //     });
  //     let existed_feilds_of_keys = foundFormKeyFeilds.map((x) => {
  //       return x.feilds;
  //     });

  //     model.feilds_array.forEach((x: any) => {
  //       let obj: InventoryForm = {
  //         key: model.key,
  //         feilds: x,
  //       };
  //       form_feilds_array.push(obj);
  //     });

  //     const result = _.differenceBy(
  //       model.feilds_array,
  //       existed_feilds_of_keys,
  //       "title"
  //     );

  //     let is_required_error_array: any = [];

  //     let regex_error_array: any = [];
  //     let finalFormFeildsDetails: any = [];
  //     result.forEach((x, i) => {
  //       if (
  //         x.is_required === true &&
  //         (x.is_required_error == "" || x.is_required_error == undefined)
  //       ) {
  //         let isRequireErrorObj = {
  //           feild: `feilds_array[${i}] is_required_error`,
  //           message: "is_required_error feild can't be empty",
  //         };

  //         is_required_error_array.push(isRequireErrorObj);
  //       }

  //       if (
  //         x.regex != "" &&
  //         (x.regex_error == "" || x.regex_error == undefined)
  //       ) {
  //         let isRegexrrorObj = {
  //           feild: `feilds_array[${i}] regex_error`,
  //           message: "regex_error feild can't be empty",
  //         };

  //         regex_error_array.push(isRegexrrorObj);
  //       }

  //       let form_obj = {
  //         feilds: { ...x },
  //         key: model.key,
  //       };

  //       finalFormFeildsDetails.push(form_obj);
  //     });

  //     //error result
  //     let errorResult: any = [];
  //     if (regex_error_array.length > 0 || is_required_error_array.length > 0) {
  //       if (regex_error_array.length > 0 && is_required_error_array.length == 0)
  //         errorResult = { regex_fail_error: regex_error_array };
  //       else if (
  //         regex_error_array.length == 0 &&
  //         is_required_error_array.length > 0
  //       )
  //         errorResult = { is_required_errors: is_required_error_array };
  //       else
  //         errorResult = {
  //           is_required_check_errors: is_required_error_array,
  //           regex_fail_errors: regex_error_array,
  //         };
  //       return {
  //         status_code: HttpStatus.BAD_REQUEST,
  //         data: { message: errorResult, error: "On Add Error" },
  //       };
  //     }

  //     let createInventoryForm = await InventoryFormModel.insertMany(
  //       finalFormFeildsDetails
  //     );

  //     if (createInventoryForm && createInventoryForm.length > 0)
  //       return {
  //         status_code: HttpStatus.OK,

  //         data: createInventoryForm,
  //       };
  //     else
  //       return {
  //         status_code: HttpStatus.BAD_REQUEST,
  //         data: {
  //           message:
  //             "These Feilds Are Already Added In This Inventory Item Form",
  //           Error: "On Add Error",
  //         },
  //       };
  //   } catch (error) {
  //     console.log(error);

  //     return {
  //       status_code: HttpStatus.INTERNAL_SERVER_ERROR,
  //       data: {
  //         message: "Internal Server Error",
  //         Error: "On Add Error",
  //       },
  //     };
  //   }
  // };
  // updateInventoryFormOld = async (
  //   req: Request,
  //   model: UpdateInventoryFormViewmodel
  // ): Promise<IServiceResult> => {
  //   try {
  //     let foundFeild = await InventoryFormModel.findById(model._id);
  //     if (foundFeild) {
  //       if (model.feilds.title) {
  //         let checkFeildExistenceDoc = await InventoryFormModel.findOne({
  //           key: foundFeild.key,
  //           "feilds.title": model.feilds.title,
  //         });

  //         if (checkFeildExistenceDoc) {
  //           if (
  //             checkFeildExistenceDoc._id.toString() != foundFeild._id.toString()
  //           )
  //             return {
  //               data: {
  //                 message:
  //                   "Feild Already Exist With This Title Under This Form",
  //                 error: "On Update Error",
  //               },
  //               status_code: HttpStatus.BAD_REQUEST,
  //             };
  //         }
  //       }

  //       let modelToSave = <DocumentType<InventoryForm>>model;
  //       modelToSave.key = foundFeild.key;

  //       let updateInventoryFormFeild = await InventoryFormModel.updateOne(
  //         { _id: model._id },
  //         modelToSave
  //       );
  //       if (updateInventoryFormFeild)
  //         return {
  //           status_code: HttpStatus.OK,

  //           data: true,
  //         };
  //       else
  //         return {
  //           status_code: HttpStatus.BAD_REQUEST,
  //           data: {
  //             message: "An Error Occurred While Updating  Form Feild",
  //             Error: "On Update Error",
  //           },
  //         };
  //     } else
  //       return {
  //         status_code: HttpStatus.BAD_REQUEST,
  //         data: {
  //           message: "Form Feild Not Found",
  //           Error: "On Update Error",
  //         },
  //       };
  //   } catch (error) {
  //     console.log(error);

  //     return {
  //       status_code: HttpStatus.INTERNAL_SERVER_ERROR,
  //       data: {
  //         message: "Internal Server Error",
  //         Error: "On Update Error",
  //       },
  //     };
  //   }
  // };
}
export default new InventoryService();
