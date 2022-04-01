const cloudinary = require("cloudinary").v2;
const request = require('request');
import { DocumentType } from "@typegoose/typegoose";
import download from "download";
import { Request } from "express";
import { UploadedFile } from "express-fileupload";
import HttpStatus from "http-status-codes";
import _ from "lodash";
import { Employees } from "../../models/employee-management-models/employee.model";
import { IServiceResult } from "../common-methods";
import { DeleteResourcesViewModel } from "./upload_viewmodel";
const remove = require("fs-extra").remove;
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});
class UploadService {
  public uploadPhotoToCloudinary = async (
    req: Request
  ): Promise<IServiceResult> => {
    let file: UploadedFile = <UploadedFile>req.files!.image;
    console.log(req.files!.image, typeof req.files!.image);

    let user = <DocumentType<Employees>>req.user;
    let uploadedUrl: any = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: `EmployeeDocuments/${user._id}/images`,
    });
    remove(file.tempFilePath);
    if (uploadedUrl)
      return {
        status_code: HttpStatus.OK,
        data: uploadedUrl.secure_url,
      };
    else
      return {
        status_code: HttpStatus.BAD_REQUEST,
        data: {
          message: "An error occurred while uploading image",
          field: "image",
        },
      };
  };

  public uploadResourcesToCloudinary = async (
    req: Request
  ): Promise<IServiceResult> => {
    try {
      if (req.query.folder != "attachments" && req.query.folder != "images") {
        let msg =
          "Folder Name Must Be From One Of Them Either 'attachments'or 'images'";
        return {
          status_code: HttpStatus.BAD_REQUEST,
          data: {
            message: msg.replace(/\\/g, ""),
            Error: "On Upload Error",
          },
        };
      }

      let pictureFiles: any = req.files!.document as UploadedFile;
      //Check if files exist
      if (!pictureFiles)
        return {
          status_code: HttpStatus.BAD_REQUEST,
          data: {
            message: "No File Found",
            Error: "On Upload Error",
          },
        };

      let filesUrlArray: string[] = [];
      let user = <DocumentType<Employees>>req.user;
      if (pictureFiles && pictureFiles.length > 0) {
        pictureFiles = _.uniqBy(pictureFiles, "name");
        await Promise.all(
          pictureFiles.map(async (doc: any) => {
            const result = await cloudinary.uploader.upload(doc.tempFilePath, {
              folder: `EmployeeDocuments/${user._id}/${req.query.folder}`,
            });
            filesUrlArray.push(result.secure_url);
            remove(doc.tempFilePath);
          })
        );
        return { status_code: HttpStatus.OK, data: filesUrlArray };
      } else if (pictureFiles && pictureFiles.tempFilePath) {
        const result = await cloudinary.uploader.upload(
          pictureFiles.tempFilePath,
          { folder: `EmployeeDocuments/${user._id}/attachments` }
        );
        return { status_code: HttpStatus.OK, data: result.secure_url };
      } else
        return {
          data: { message: "Files Not Uploaded", error: "On Update Error" },
          status_code: HttpStatus.BAD_REQUEST,
        };
    } catch (err) {
      console.log(err);

      return {
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        data: {
          message: "Internal Server Error",
          Error: "On Upload Error",
        },
      };
    }
  };

  downloadFile = async (
    downloadUrl: string,
    folder: string,
    fileName: string
  ) => {
    try {
      await download(downloadUrl, folder, {
        filename: fileName,
      });
      return fileName;
    } catch (ex) {
      return "";
    }
  };

  public uploadCertificateToCloudinary = async (
    doc_path: string,
    emp_id: string
  ): Promise<IServiceResult> => {
    let uploadedUrl: any = await cloudinary.uploader.upload(doc_path, {
      folder: `EmployeeDocuments/${emp_id}/certficate`,
    });

    if (uploadedUrl)
      return {
        status_code: HttpStatus.OK,
        data: uploadedUrl.secure_url,
      };
    else
      return {
        status_code: HttpStatus.BAD_REQUEST,
        data: {
          message: "An error occurred while uploading Certificate",
          field: "image",
        },
      };
  };
  public deleteResoucesFromCloudinary = async (
    req: Request,
    model: DeleteResourcesViewModel
  ): Promise<IServiceResult> => {
    let public_ids: string[] = [];
    model.files.forEach((url) => {
      let temp_public_id_result = url
        .split("/")
        .slice(7, 11)
        .join("/")
        .split(".");
      let id = temp_public_id_result[0].toString();
      public_ids.push(id);
    });

    console.log(public_ids);

    let delete_result = await cloudinary.api.delete_all_resources(
      public_ids,
      function (error: any, result: any) {
        console.log("done");
      }
    );
    console.log(delete_result);
    let deletion_temp_result = Object.entries(delete_result.deleted);
    if (delete_result && deletion_temp_result.length > 0)
      return {
        status_code: HttpStatus.OK,
        data: delete_result,
      };
    else
      return {
        status_code: HttpStatus.BAD_REQUEST,
        data: {
          message: "An Error Occurred While Deleting Resources From Cloudinary",
          field: "files",
        },
      };
  };

}

export default new UploadService();
